from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CLIENT_URL
from routers import admin, auth, chat, report, section, template

app = FastAPI(description="DPUCARE web chatbot")

allow_origins = [origin.strip() for origin in CLIENT_URL.split(",")] if CLIENT_URL else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(section.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(report.router)
app.include_router(template.router)
