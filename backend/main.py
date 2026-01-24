from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# This is CRITICAL for the frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you'll replace this with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "AI Backend is Online"}

@app.get("/api/greet")
def greet_user(name: str = "Developer"):
    return {"message": f"Hello {name}, ready to build with AI?"}