import pandas as pd
from typing import Optional, List, Dict
from fastapi import HTTPException


USERS_DATA_PATH = 'data/users.xlsx'
JOBS_DATA_PATH = 'data/jobs_data.xlsx'

# by sheet name and then required columns within the sheet - TODO: make gloabl var?
REQUIRED_COLS = {
    'ActiveQueue': [
        'Name', 
        'WorkflowTypeID', 
        'SubmittedBy', 
        'StartTime', 
        'EndTime', 
        'StatusMessage', 
        'OutputResult ', # typo in the xslx
        'errorMessage',
    ],
    'WorkflowDefinition': [
        'WorkflowTypeID', 
        'WorkflowType',
    ]
}


def read_users():
    ''' read and return the entire users df '''

    try:
        df = pd.read_excel(USERS_DATA_PATH)
        return df
    except Exception as e:
        print(f"Error reading users data: {e}")
        raise HTTPException(status_code=500, detail="Error reading users data")


def get_user_details(username: str):
    ''' returns user details row for the given username '''

    df = read_users()
    if username not in df['Username'].values:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    user_row = df[df['Username'] == username].iloc[0]
    
    return user_row


def read_jobs(username: Optional[str] = None) -> pd.DataFrame:
    ''' 
    Reads the required jobs data from the relevant xlsx, with the option
    to restrict the search by the username.
    Returns a pandas dataframe.
    '''

    try:
        # read required columns from the ActiveQueue sheet
        jobs_df = pd.read_excel(
            JOBS_DATA_PATH,
            sheet_name='ActiveQueue',
            usecols=REQUIRED_COLS['ActiveQueue']
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
            usecols=REQUIRED_COLS['WorkflowDefinition']
        )

        # filter by the necessary workflow_ids
        workflow_df = workflow_df[workflow_df["WorkflowTypeID"].isin(workflow_ids)]

        # drop duplicates
        workflow_df = workflow_df.drop_duplicates(subset=['WorkflowTypeID'])

        # merge the dataframes by WorkflowTypeID
        merged_df = jobs_df.merge(workflow_df, on="WorkflowTypeID", how="left")

        return merged_df

    except KeyError as e:
        ValueError(f"Missing required column {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to read jobs data: {e}")
    

def format_jobs_data(jobs_df) -> List[Dict]:
    ''' 
    Formats the data extracted from the jobs xlsx.
    Calculates duration, sets a value for progress, an object for details,
    renames columns as required and continues with only the necessaru columns.
    The formatted dataframe is converted to a list of dictionaries with nan values
    handled to prevent errors with the json response.
    Required final fields: job_id, workflow_type, user, start_time, duration, progress, 
    status, details {errorMessage, OutputResult}
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
    
    # get workflow task
    
    # function to create details field
    def set_details(row):
        # use empty string rather than nan for the json later
        def safe_get(field):
            val = row.get(field)
            return "" if pd.isna(val) else val
        return { 
            "errorMessage": safe_get("errorMessage"),
            "OutputResult": safe_get("OutputResult "),
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
