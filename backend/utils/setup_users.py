''' 
    Generates the users.xlsx file based on the data from the 
    main jobs queue xslx file and includes a username, list of 
    associated jobs, a hashed password and role for each user.
'''

import pandas as pd
from passlib.hash import bcrypt
from dotenv import load_dotenv
import os

load_dotenv()
DEFAULT_PASSWORD = os.getenv("DEFAULT_PASSWORD")
JOBS_DATA_PATH = 'data/jobs_data.xlsx'
USERS_DATA_OUT = 'data/users.xlsx'


# run from backend dir, with: python3 utils/setup_users.py
if __name__ == "__main__":

    # read the xlsx file once into a pandas df
    df = pd.read_excel(JOBS_DATA_PATH)

    # to store user objects
    user_objects = []

    # group jobs (Name) by username (SubmittedBy)
    grouped = df.groupby("SubmittedBy")["Name"].apply(list)

    # create the user objects
    for username, jobs in grouped.items():
        user = {
            "Username": username,
            "Jobs": jobs,
            "PasswordHash": bcrypt.hash(DEFAULT_PASSWORD),
            "Role": "admin"  # default set all users to admin for now
        }
        user_objects.append(user)

    # convert list of dicts to dataframe
    users_df = pd.DataFrame(user_objects)

    # write users dataframe to excel
    users_df.to_excel(USERS_DATA_OUT, index=False)

    print('The users sheet can be found at:', USERS_DATA_OUT)
