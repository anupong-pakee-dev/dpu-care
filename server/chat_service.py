from bson.objectid import ObjectId

from chatbot import main
from config import MODEL_NAME
from database.collections import admin_collection, history_template_collection
from utils import loop_data


def get_admin_config():
    """Returns the (singleton) admin_config document, stringified."""
    chatbot_info = admin_collection.find({})
    return loop_data(data=chatbot_info)[0]


def run_chatbot(template_id: str, text: str, thread_id: str, model_name: str = MODEL_NAME):
    """Runs the chatbot for the given template/thread, then updates the running token total."""
    admin_config = get_admin_config()
    template = history_template_collection.find_one({"_id": ObjectId(template_id)})

    llm = main(
        model_name=model_name,
        system_template=template.get("template"),
        text=text,
        thread_id=thread_id
    )

    update_tokens = {
        "total_tokens": int(admin_config["total_tokens"]) + int(llm["total_tokens"])
    }
    admin_collection.update_one({"_id": ObjectId(admin_config["_id"])}, {"$set": update_tokens})

    return llm
