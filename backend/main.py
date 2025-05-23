from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from typing import Optional, Tuple, List, Dict
from passlib.hash import bcrypt
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

# jwt configuration and security
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
security = HTTPBearer()

app = FastAPI()

# allow access from teh frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS_DATA_PATH = 'data/users.xlsx'
JOBS_DATA_PATH = 'data/jobs_data.xlsx'

# pydantic model for credential request body
class Credentials(BaseModel):
    username: str
    password: str


# functions - TODO: move to a utils file
def verify_token(auth_credentials: HTTPAuthorizationCredentials = Depends(security)):
    ''' 
    Using fastAPI's dependecy injection system to call the security function
    HTTPBearer() which then parses the auth credentials (of type 
    HTTPAuthorizationCredentials object) so that the jwt can be decoded and verified 
    for the protected endpoints
    '''
    # extract the token
    token = auth_credentials.credentials

    try:
        # a valid token will return the payload: username, role, exp
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")


# TODO: move to a utils file
def read_jobs(username: Optional[str] = None) -> pd.DataFrame:
    ''' 
    Reads the required jobs data from the relevant xlsx, with the option
    to restrict the search by the username.
    Returns a pandas dataframe.
    '''

    # by sheet name and then required columns within the sheet - TODO: make gloabl var?
    required_columns = {
        'ActiveQueue': [
            'Name', 
            'WorkflowTypeID', 
            'SubmittedBy', 
            'StartTime', 
            'EndTime', 
            'StatusMessage', 
            'OutputResult ', # typo in the xslx
            'errorMessage'
        ],
        'WorkflowDefinition': [
            'WorkflowTypeID', 
            'WorkflowType', 
            'DependentOn', 
            'WorkflowTask'
        ]
    }

    try:
        # read required columns from the ActiveQueue sheet
        jobs_df = pd.read_excel(
            JOBS_DATA_PATH,
            sheet_name='ActiveQueue',
            usecols=required_columns['ActiveQueue']
        )

        # filtering if username is provided
        # NOTE: ideal ony the required data would be read in teh first place but skiprows 
        # is better supported for read_csv() than read_excel()
        if username:
            jobs_df = jobs_df[jobs_df["SubmittedBy"] == username]

        # extract the unique WorkflowTypeIDs
        workflow_ids = jobs_df["WorkflowTypeID"].dropna().unique().tolist()

        # read required columns from the WorkflowDefinition sheet
        workflow_df = pd.read_excel(
            JOBS_DATA_PATH,
            sheet_name='WorkflowDefinition',
            usecols=required_columns['WorkflowDefinition']
        )

        # filter by the necessary workflow_ids
        workflow_df = workflow_df[workflow_df["WorkflowTypeID"].isin(workflow_ids)]

        # merge the dataframes by WorkflowTypeID
        merged_df = jobs_df.merge(workflow_df, on="WorkflowTypeID", how="left")

        return merged_df

    except KeyError as e:
        ValueError(f"Missing required column {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to read jobs data: {e}")


# TODO: move to utils
def format_jobs_data(jobs_df) -> List[Dict]:
    ''' 
    Formats the data extracted from the jobs xlsx.
    Calculates duration, sets a value for progress, an object for details,
    renames columns as required and continues with only the necessaru columns.
    The formatted dataframe is converted to a list of dictionaries with nan values
    handled to prevent errors with the json response.
    Required final fields: job_id, workflow_type, user, start_time, duration, progress, 
    status, details {errorMessage, OutputResult, WorkflowTask, DependentOn}
    Returns a list of dictionaries.
    '''

    # function to calc duration
    def calc_duration(row):
        if pd.isna(row['EndTime']):
            return 'N/A'
        return str(row['EndTime']- row['StartTime'])
    
    # function to determine progress
    def set_progress(row):
        return 'Finished' if pd.notna(row['EndTime']) else 'Active'
    
    # function to create details field
    def set_details(row):
        # use empty string rather than nan for the json later
        def safe_get(field):
            val = row.get(field)
            return "" if pd.isna(val) else val
        return { 
            "errorMessage": safe_get("errorMessage"),
            "OutputResult": safe_get("OutputResult "),
            "WorkflowTask": safe_get("WorkflowTask"),
            "DependentOn": safe_get("DependentOn")
        }

    # first convert times into pandas datetime
    jobs_df["StartTime"] = pd.to_datetime(jobs_df["StartTime"], errors="coerce")
    jobs_df["EndTime"] = pd.to_datetime(jobs_df["EndTime"], errors="coerce")
    
    # apply duration and progress to the df (axis 1 so its applied on rows)
    jobs_df['duration'] = jobs_df.apply(calc_duration, axis=1)
    jobs_df['progress'] = jobs_df.apply(set_progress, axis=1)
    
    # rename fields
    formatted_df = jobs_df.rename(columns={
        "Name": "job_id",
        "WorkflowType": "workflow_type",
        "SubmittedBy": "user",
        "StartTime": "start_time",
        "StatusMessage": "status",
    })
    
    # apply details to the df (doesnt require columns which were renamed)
    formatted_df['details'] = formatted_df.apply(set_details, axis=1)

    # define the final dataframe
    final_df = formatted_df[[
        "job_id", 
        "workflow_type", 
        "user", 
        "start_time", 
        "duration", 
        "progress", 
        "status", 
        "details"
    ]]

    # convert each row into a dict replacing nans with null for json later
    return final_df.where(pd.notnull(final_df), None).to_dict(orient="records")


# move to utils
def paginate(data: List[dict], skip: int, limit: Optional[int]) -> dict:
    ''' 
    Returns the total length of the data and the required page of
    results, defined by skip and limit query parameters.
    '''
    if limit is None:
        paginated_results = data[skip:]
    else:
        paginated_results = data[skip: skip + limit]

    return {
        "total": len(data),
        "results": paginated_results
    }


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
    # TODO: move into a funcion in a utils file
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
        
        # generate jwt
        # TODO: move into a function in auth_utils.py
        payload = {
            "username": credentials.username,
            'role': user_details['Role'],
            "exp": datetime.now(timezone.utc) + timedelta(hours=1)
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
