from bson.objectid import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from auth import require_auth
from database.base_model import (
    CreateSection,
    CreateTemplate,
    SelectMainTemplate,
    SelectSeconderyTemplate,
    UpdateTemplate,
)
from database.collections import admin_collection, history_template_collection, section_template_collection
from utils import loop_data

router = APIRouter()


# API for Get History Template
@router.get("/history-template/{section_id}")
async def history_template(section_id: str, _payload: dict = Depends(require_auth)):
    res = history_template_collection.find({"section_id": section_id})

    return loop_data(res)


# API for Update History Template
@router.put("/history-template/{_id}")
async def update_template(_id: str, form_data: UpdateTemplate, _payload: dict = Depends(require_auth)):
    data = {
        "template": form_data.template
    }

    history_template_collection.update_one({"_id": ObjectId(_id)}, {"$set": data})

    return {
        "msg": "update history template successful"
    }


# API for Create History Template
@router.post("/history-template/{section_id}")
async def create_template(section_id: str, form_data: CreateTemplate, _payload: dict = Depends(require_auth)):
    data = {
        "section_id": section_id,
        "name": form_data.name,
        "template": form_data.template
    }

    history_template_collection.insert_one(data)

    return {
        "msg": "create template success"
    }


# API for Delete History Template
@router.delete("/history-template/{_id}")
async def delete_template(_id: str, _payload: dict = Depends(require_auth)):
    admin_config = loop_data(data=admin_collection.find({}))[0]

    if admin_config["select_main"] == _id or admin_config["select_secondery"] == _id:
        raise HTTPException(status_code=401, detail="not allowed delete")

    history_template_collection.delete_one({"_id": ObjectId(_id)})

    return {
        "msg": "delete history template successful"
    }


# API for Get Section Template
@router.get("/section-template")
async def section_template(_payload: dict = Depends(require_auth)):
    res = section_template_collection.find({})

    return loop_data(res)


# API for Create Section Template
@router.post("/section-template")
async def create_section_template(form_data: CreateSection, _payload: dict = Depends(require_auth)):
    data = {
        "name": form_data.name
    }

    section_template_collection.insert_one(data)

    return {
        "msg": "create section template"
    }


# API for Delete Section Template
@router.delete("/section-template/{section_id}")
async def delete_section_template(section_id: str, _payload: dict = Depends(require_auth)):
    admin_config = loop_data(data=admin_collection.find({}))[0]
    templates_in_section = loop_data(history_template_collection.find({"section_id": section_id}))

    target_ids = [admin_config["select_main"], admin_config["select_secondery"]]
    existing_ids = {item["_id"] for item in templates_in_section}
    if any(target in existing_ids for target in target_ids):
        raise HTTPException(status_code=401, detail="not allowed delete")

    history_template_collection.delete_many({"section_id": section_id})
    section_template_collection.delete_one({"_id": ObjectId(section_id)})

    return {
        "msg": "delete successful"
    }


# API for Select Main Template
@router.put("/select-main-template/{user_id}")
async def select_main_template(user_id: str, form_data: SelectMainTemplate, _payload: dict = Depends(require_auth)):
    data = {
        "select_main": form_data.select_main
    }

    admin_collection.update_one({"user_id": user_id}, {"$set": data})

    return {
        "msg": "update select main template"
    }


# API for Select Secondery Template
@router.put("/select-secondry-template/{user_id}")
async def select_secondary_template(user_id: str, form_data: SelectSeconderyTemplate, _payload: dict = Depends(require_auth)):
    data = {
        "select_secondery": form_data.select_secondery
    }

    admin_collection.update_one({"user_id": user_id}, {"$set": data})

    return {
        "msg": "update select secondery template"
    }
