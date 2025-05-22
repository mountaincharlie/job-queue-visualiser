from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from passlib.hash import bcrypt
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

# jwt configuration
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

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


# check user credentials endpoint
@app.post("/users")
async def check_credentials(credentials: Credentials):
    try:
        # read the xlsx file once into a pandas df
        df = pd.read_excel(USERS_DATA_PATH)

        # check if the user email exists
        if credentials.username not in df['Username'].values:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    
        # get the row for the user
        user_details = df[df['Username'] == credentials.username].iloc[0]
        hashed_password = user_details['PasswordHash']

        # check if the credentials password matches
        if not bcrypt.verify(credentials.password, hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # generate jwt - NOTE: can add expire time to token
        payload = {
            "username": credentials.username,
            'role': user_details['Role'],
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        print('user jobs: ', user_details['Jobs'])

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
