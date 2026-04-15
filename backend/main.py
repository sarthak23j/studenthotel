from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, rooms, allocations, users

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Hotel Management")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(allocations.router, prefix="/api/allocations", tags=["Allocations"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# Serve React static files
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_react(full_path: str):
    return FileResponse(os.path.join(frontend_dist, "index.html"))