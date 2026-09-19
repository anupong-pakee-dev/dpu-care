from fastapi import APIRouter, Depends

from auth import require_admin
from chat_service import get_admin_config, run_chatbot
from database.base_model import Admin
from database.collections import admin_collection, user_collection

router = APIRouter()


# API for Get Chatbot Config
@router.get("/chatbot-config/{user_id}")
async def get_chatbot_config(user_id: str, _admin: dict = Depends(require_admin)):
    chatbot_config = admin_collection.find_one({"user_id": user_id})

    return {
        "total_tokens": chatbot_config.get("total_tokens"),
        "select_template": chatbot_config.get("select_template")
    }


# API for Test Chatbot (Admin)
@router.post("/test-main-chatbot/{user_id}/{section_id}")
async def chatbot_admin(user_id: str, section_id: str, form_data: Admin, _admin: dict = Depends(require_admin)):
    admin_config = get_admin_config()

    if form_data.mode == "advice":
        template_id = admin_config["select_main"]
    if form_data.mode == "just_venting":
        template_id = admin_config["select_secondery"]

    llm = run_chatbot(template_id=template_id, text=form_data.human, thread_id=section_id)

    return {
        "msg": "create new history successful",
        "question": form_data.human,
        "answer": llm["response"]
    }


# API for Get Count All User
@router.get("/get-count-all-user/{user_id}")
async def get_count_all_user(user_id: str, _admin: dict = Depends(require_admin)):
    user_count = user_collection.count_documents({})
    return {
        "msg": "get user count successful",
        "total_user": user_count
    }
