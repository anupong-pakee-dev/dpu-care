import os

from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 1440
VERIFY_TOKEN_EXPIRE_MINUTES = 10

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_URL = os.getenv("CLIENT_URL")
MODEL_NAME = os.getenv("MODEL_NAME")
