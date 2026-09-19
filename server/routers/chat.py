from fastapi import APIRouter, Depends

from auth import require_auth
from chat_service import get_admin_config, run_chatbot
from database.base_model import Question
from database.collections import history_collection
from utils import loop_data

router = APIRouter()


# API for Create History (Main Chatbot)
@router.post("/main-chatbot/{section_id}")
async def create_history(section_id: str, question: Question, _payload: dict = Depends(require_auth)):
    admin_config = get_admin_config()
    llm = run_chatbot(template_id=admin_config["select_main"], text=question.human, thread_id=section_id)

    new_data = {
        "section_id": section_id,
        "question": question.human,
        "answer": llm["response"]
    }
    result = history_collection.insert_one(new_data)

    return {
        "msg": "create new history successful",
        "id": str(result.inserted_id),
        "section_id": section_id,
        "question": question.human,
        "answer": llm["response"]
    }


# API for Get History
@router.get("/history/{section_id}")
async def get_history(section_id: str, _payload: dict = Depends(require_auth)):
    response = history_collection.find({"section_id": section_id})

    return loop_data(data=response)


# API for Chatbot (just_venting)
@router.post("/just-venting-chatbot/{section_id}")
async def chatbot_secondery(section_id: str, question: Question, _payload: dict = Depends(require_auth)):
    admin_config = get_admin_config()
    llm = run_chatbot(template_id=admin_config["select_secondery"], text=question.human, thread_id=section_id)

    return {
        "question": question.human,
        "answer": llm["response"]
    }


# API for None-Login Test Chatbot (limit 3 question)
@router.post("/test-chatbot/{section_id}")
async def non_user_create_history(section_id: str, question: Question):
    admin_config = get_admin_config()
    llm = run_chatbot(
        template_id=admin_config["select_main"],
        text=question.human,
        thread_id=section_id,
        model_name="gpt-4o-mini"
    )

    return {
        "question": question.human,
        "answer": llm["response"]
    }
