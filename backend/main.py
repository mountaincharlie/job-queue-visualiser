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

# allow access from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS_DATA_PATH = 'data/users.xlsx'

# pydantic model for credential request body
class Credentials(BaseModel):
    ''' class for user credentials '''
    username: str
    password: str


@app.get("/jobs/mine")
async def get_my_jobs(
    payload: dict = Depends(verify_token),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1, le=500)
):
    ''' 
    Get jobs belonging to a specific user using the returned payload
    from verify_token.
    Params, skip and optional limit used for pagination and allowing
    limited requests to be made.
    Returns a list of dictionaries which FastAPI handles sending to the
    frontend in JSON format.
    '''

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

    # handles the specified expected errors
    except HTTPException as http_err:
        raise http_err

    # handles other errors
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="An error occured")


# # get all jobs endpoint (user details not required)
@app.get("/jobs")
async def get_all_jobs(
    _: dict = Depends(verify_token),
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None, ge=1, le=500)
):
    ''' 
    Get all job.
    Depends on the user token being verified.
    Params, skip and optional limit used for pagination and allowing
    limited requests to be made.
    Returns a list of dictionaries which FastAPI handles sending to the
    frontend in JSON format.
    '''

    try:
        # call a function to read all columns from the xlsx sheet
        jobs_df = read_jobs()

        # pass into formatting function
        formatted_jobs_data = format_jobs_data(jobs_df)

        # paginate data
        paginated_jobs_data = paginate(formatted_jobs_data, skip, limit)

        return paginated_jobs_data

    # handles the specified expected errors
    except HTTPException as http_err:
        raise http_err

    # handles other errors
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="An error occured")


# check user credentials endpoint
@app.post("/users")
async def check_credentials(credentials: Credentials):
    ''' 
    Send the user credentials of type Credentials, to compare to the stored
    user records.
    Gets the user's details from the database (users.xlsx sheet) and compares the
    stored hashed password with the credentials.password using bcrypt.
    For a valid username and password a JSON Web Token is generated incorporating the
    users username and role.
    Returns the users details as a dictionary which FastAPI handles sending to the
    frontend in JSON format.
    '''

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
            'jwt': token
        }

    # handles the specified expected errors
    except HTTPException as http_err:
        raise http_err

    # handles other errors
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="An error occured")
