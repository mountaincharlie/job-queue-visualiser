# Job Queue Visualiser

## Running locally

Requirements:
- Python 3.8+
- Node.js and npm

### Running locally:
- Pull the repo locally
```
git clone https://github.com/mountaincharlie/job-queue-visualiser.git
cd job-queue-visualiser
```
- Setup and run the backend
    - Mac / Linux
    ```
    cd backend
    python3 -m venv venv  # only required on the first setup
    source venv/bin/activate  # only if the virtual env is not already active
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    ```
    - Windows
    ```
    cd backend
    python3 -m venv venv  # only required on the first setup
    source venv/Scripts/activate  # only if the virtual env is not already active
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    ```
- Setup and run the frontend (from the project root)
```
cd frontend
npm install
npm run dev
```

#### For the frontend, navigate to: `http://localhost:5173/`
#### For API docs, navigate to: `http://localhost:8000/docs`
