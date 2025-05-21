from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# test endpoint
@app.get("/")
async def root():
    return {"message": "Hellow World"}
