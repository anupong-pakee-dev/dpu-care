from bson.objectid import ObjectId
from fastapi import APIRouter, Depends

from auth import require_admin
from database.base_model import Report
from database.collections import report_collection
from utils import loop_data

router = APIRouter()


# API for Create Report
@router.post("/report")
async def create_report(report: Report):
    new_data = {
        "user_id": report.user_id,
        "timestamp": report.timestamp,
        "title": report.title,
        "description": report.description,
        "status": report.status
    }

    report_collection.insert_one(new_data)

    return {
        "msg": "create report successful"
    }


# API for Get Report
@router.get("/report/{user_id}")
async def get_report(user_id: str, _admin: dict = Depends(require_admin)):
    report_info = report_collection.find({})

    return loop_data(report_info)


# API for Delete a Report
@router.delete("/report/{user_id}/{report_id}")
async def delete_report(user_id: str, report_id: str, _admin: dict = Depends(require_admin)):
    report_collection.delete_one({"_id": ObjectId(report_id)})

    return {
        "msg": "delete report successful"
    }
