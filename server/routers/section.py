from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from auth import require_auth
from config import ACCESS_TOKEN_EXPIRE_MINUTES
from database.collections import (
    checkpoint_writes_collection,
    checkpoints_collection,
    history_collection,
    section_collection,
)
from utils import loop_data

router = APIRouter()


# API for Create Section
@router.post("/section/{user_id}")
async def create_section(user_id: str, _payload: dict = Depends(require_auth)):
    dt = datetime.now()

    data = {
        "user_id": user_id,
        "time": f"{dt.day}-{dt.month}-{dt.year}",
    }
    res = section_collection.insert_one(data)

    response = JSONResponse(content={"msg": "Create section successful"})
    response.set_cookie(
        key="section_id",
        value=str(res.inserted_id),
        httponly=True,
        secure=True,
        samesite="None",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return response


# API for Get Section
@router.get("/section/{user_id}")
async def get_section(user_id: str, _payload: dict = Depends(require_auth)):
    res = section_collection.find(
        {"user_id": user_id}
    )

    return loop_data(data=res)


# API for Delete Section
@router.delete("/section/{section_id}")
async def delete_section(section_id: str, _payload: dict = Depends(require_auth)):
    checkpoint_writes_collection.delete_many({"thread_id": section_id})
    checkpoints_collection.delete_many({"thread_id": section_id})
    history_collection.delete_many({"section_id": section_id})
    section_collection.delete_one({"_id": ObjectId(section_id)})

    return {
        "msg": "delete section successful"
    }


# API for Delete Section (non user)
@router.delete("/section-non-user/{section_id}")
async def delete_section_non_user(section_id: str):
    checkpoint_writes_collection.delete_many({"thread_id": section_id})
    checkpoints_collection.delete_many({"thread_id": section_id})

    return {
        "msg": "delete section non-user successful"
    }
