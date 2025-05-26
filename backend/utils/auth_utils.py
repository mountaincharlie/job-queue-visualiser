from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

# jwt configuration and security
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
security = HTTPBearer()


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


def generate_jwt(username, role):
    ''' generates the jwt for a user along with the username, role and expiry time '''

    payload = {
        "username": username,
        'role': role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
