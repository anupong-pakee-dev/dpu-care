import secrets

from fastapi.responses import JSONResponse

from config import ACCESS_TOKEN_EXPIRE_MINUTES


def loop_data(data: list):
    """function loop_data
    parameter:
        data: list (require)"""

    raw_data = []
    for detail in data:
        raw_object = {}
        for key, value in detail.items():
            raw_object[key] = str(value)
        raw_data.append(raw_object)

    return raw_data


def generate_verification_code():
    return str(secrets.randbelow(1000000)).zfill(6)


def set_auth_cookies(response: JSONResponse, token: str, user_id, role: str):
    """Set the access_token, user_id, and role cookies shared by every auth route."""
    max_age = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    for key, value in (("access_token", token), ("user_id", str(user_id)), ("role", role)):
        response.set_cookie(
            key=key,
            value=value,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=max_age,
            path="/"
        )
