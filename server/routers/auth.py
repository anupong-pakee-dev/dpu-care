import os

import bcrypt
import requests
from fastapi import APIRouter, Cookie, Depends, HTTPException
from fastapi.responses import JSONResponse

from auth import require_auth
from config import ACCESS_TOKEN_EXPIRE_MINUTES, VERIFY_TOKEN_EXPIRE_MINUTES
from database.base_model import GoogleToken, Login, Register, RePassword
from database.collections import user_collection
from middleware.send_email import _send_email
from middleware.tokens import create_access_token, decode_access_token
from utils import generate_verification_code, set_auth_cookies

router = APIRouter()


def verify_google_token(access_token: str):
    try:
        response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}')

        if response.status_code != 200:
            raise ValueError('Invalid access token or expired token')

        token_info = response.json()

        if 'error' in token_info:
            raise ValueError(f"Error verifying token: {token_info['error']}")

        return token_info
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {e}")


# API for Test Connect
@router.get("/test-connect")
async def test_connect():
    return {"msg": "Connect successful"}


# API for Protected
@router.get("/protected")
async def protected(payload: dict = Depends(require_auth)):
    return {"msg": f"{payload['sub']}"}


# API for Get User Data
@router.get("/get-user")
async def get_user(
    user_id: str = Cookie(None),
    role: str = Cookie(None),
    section_id: str = Cookie(None),
    _payload: dict = Depends(require_auth)
):
    return {
        "user_id": user_id,
        "section_id": section_id,
        "role": role
    }


# API for Google Sign IN / Sign Up
@router.post("/auth-google")
async def google_login(google_token: GoogleToken):
    user_data = verify_google_token(google_token.token)
    email = user_data['email']
    user_info = user_collection.find_one({"email": email})
    token = create_access_token(data={"sub": email}, minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    if user_info:
        response = JSONResponse(content={"msg": "Login successful"})
        set_auth_cookies(response, token=token, user_id=user_info.get("_id"), role=user_info.get("role"))

        return response

    email_sp = email.split("@")
    res = user_collection.insert_one({
        "username": email_sp[0],
        "email": email,
        "role": "user"
    })

    response = JSONResponse(content={"msg": "Register successful"})
    set_auth_cookies(response, token=token, user_id=res.inserted_id, role="user")

    return response


# API for Sendemail
@router.get("/send-email/{email}")
async def send_email(email: str):
    verification_code = generate_verification_code()
    smpt_user = os.getenv("SMTP_USER")

    message = f"""สวัสดีค่ะ/ครับ\n\nขอบคุณที่ลงทะเบียนกับเรา!\nเพื่อความปลอดภัยและยืนยันตัวตนของคุณ กรุณากรอกรหัสยืนยันด้านล่างนี้ในหน้าเว็บไซต์:\n\nรหัสยืนยัน: [{verification_code}]\n\nรหัสนี้จะหมดอายุภายใน [{VERIFY_TOKEN_EXPIRE_MINUTES} minutes] หากคุณไม่ได้ทำการสมัครสมาชิกหรือไม่ขอรับรหัสยืนยันนี้ กรุณาติดต่อเราที่ [{os.getenv("SMTP_USER")}].\n\nขอบคุณค่ะ/ครับ\nทีมงาน [DPUCARE]"""

    result = _send_email(
        title="Verify Email",
        from_=smpt_user,
        to_=email,
        content=message
    )
    verify_token = create_access_token(data={"sub": email}, minutes=VERIFY_TOKEN_EXPIRE_MINUTES)

    return {
        "msg": result,
        "verify_tk": verify_token,
        "verification_code": verification_code
    }


# API for Register
@router.post("/register/{verify_tk}/{verification_code}")
async def register(form_data: Register, verify_tk: str, verification_code: str):
    payload = decode_access_token(token=verify_tk)

    if payload == "Invalid token":
        return "Invalid token"
    if payload == "Token expired":
        return "Token expired"

    if form_data.verify_code != verification_code:
        return "verification_code fail"

    ck_user = user_collection.find_one({"username": form_data.username})
    check_email = user_collection.find_one({"email": form_data.email})

    if ck_user:
        raise HTTPException(status_code=400, detail="user already exists")
    if check_email:
        raise HTTPException(status_code=400, detail="email already exists")

    hash_password = bcrypt.hashpw(form_data.password.encode("utf-8"), bcrypt.gensalt())

    user_info = user_collection.insert_one({
        "username": form_data.username,
        "password": hash_password.decode("utf-8"),
        "email": form_data.email,
        "role": "user"
    })

    token = create_access_token(data={"sub": form_data.username}, minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    response = JSONResponse(content={"msg": "Register successful"})
    set_auth_cookies(response, token=token, user_id=user_info.inserted_id, role="user")

    return response


# API for Login
@router.post("/login")
async def login(form_data: Login):
    user = user_collection.find_one(
        {"$or": [{"username": form_data.username}, {"email": form_data.username}]}
    )

    if not user:
        raise HTTPException(status_code=400, detail="user or email not found")
    if not bcrypt.checkpw(
        form_data.password.encode("utf-8"), user["password"].encode("utf-8")
    ):
        raise HTTPException(status_code=400, detail="password is incorrect")

    token = create_access_token(data={"sub": form_data.username}, minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    response = JSONResponse(content={"msg": "Login successful"})
    set_auth_cookies(response, token=token, user_id=user.get("_id"), role=user.get("role"))

    return response


# API for Forgot Password
@router.put("/forgot-password/{verify_tk}/{verification_code}")
async def forgot_password(form_data: RePassword, verify_tk: str, verification_code: str):
    payload = decode_access_token(token=verify_tk)
    if payload == "Invalid token":
        return "Invalid token"
    if payload == "Token expired":
        return "Token expired"

    user_info = user_collection.find_one({"email": form_data.email})
    if not user_info:
        raise HTTPException(status_code=400, detail="no found email")

    if form_data.verify_code != verification_code:
        return "verification_code fail"

    hash_password = bcrypt.hashpw(form_data.password.encode("utf-8"), bcrypt.gensalt())
    user_collection.update_one({"email": form_data.email}, {"$set": {"password": hash_password.decode("utf-8")}})

    return {
        "msg": "Update password success"
    }


# API for Logout
@router.get("/logout")
async def logout():
    response = JSONResponse(content={"msg": "Logged out"})
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="user_id")
    response.delete_cookie(key="section_id")
    response.delete_cookie(key="role")

    return response
