from utils.auth_utils import verify_token, generate_jwt
from utils.data_utils import get_user_details, read_jobs, format_jobs_data, paginate
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from typing import Optional
from passlib.hash import bcrypt
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# allow access from teh frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS_DATA_PATH = 'data/users.xlsx'

# pydantic model for credential request body
class Credentials(BaseModel):
    username: str
    password: str


@app.get("/jobs/mine")
async def get_my_jobs(
    payload: dict = Depends(verify_token),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1, le=500)
):
    print('get my jobs')
    try:
        username = payload.get('username')
        # raise a bad request exception if no username 
        if not username:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # call a function to read specific columns from the xlsx sheet
        # jobs/mine passes the username to filter the request
        jobs_df = read_jobs(username)

        # pass into formatting function
        formatted_jobs_data = format_jobs_data(jobs_df)

        # paginate data
        paginated_jobs_data = paginate(formatted_jobs_data, skip, limit)

        return paginated_jobs_data

    except HTTPException as http_err:
        raise http_err

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="An error occured")

    

# # get all jobs endpoint (user details not required)
# @app.get("/jobs")
# async def get_all_jobs(_: dict = Depends(verify_token)):


# check user credentials endpoint
@app.post("/users")
async def check_credentials(credentials: Credentials):
    try:
        # get the row for the user
        user_details = get_user_details(credentials.username)
        hashed_password = user_details['PasswordHash']

        # check if the credentials password matches
        if not bcrypt.verify(credentials.password, hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # generate jwt
        token = generate_jwt(credentials.username, user_details['Role'])

        # return user object
        return {
            'username': credentials.username,
            'jobs': user_details['Jobs'],
            'role': user_details['Role'],
            'jwt': token
        }
    
    except HTTPException as http_err:
        raise http_err

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="An error occured")
