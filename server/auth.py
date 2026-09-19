from bson.objectid import ObjectId
from fastapi import Cookie, Depends, HTTPException

from database.collections import user_collection
from middleware.tokens import decode_access_token


def require_auth(access_token: str = Cookie(None)):
    """FastAPI dependency: decodes the access_token cookie or raises 401."""
    payload = decode_access_token(token=access_token)

    if payload in ["Invalid token", "Token expired"]:
        raise HTTPException(status_code=401, detail=payload)

    return payload


def require_admin(user_id: str, _payload: dict = Depends(require_auth)):
    """FastAPI dependency: requires a valid session AND an admin user_id."""
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied: not an admin")

    return user
