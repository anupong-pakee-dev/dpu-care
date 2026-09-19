from database.mongodb import mongo_client

user_collection = mongo_client(database="dpu_care", collection="user")
section_collection = mongo_client(database="dpu_care", collection="section")
history_collection = mongo_client(database="dpu_care", collection="history")
admin_collection = mongo_client(database="dpu_care", collection="admin_config")
report_collection = mongo_client(database="dpu_care", collection="reports")
checkpoints_collection = mongo_client(database="dpu_care", collection="checkpoints")
checkpoint_writes_collection = mongo_client(database="dpu_care", collection="checkpoint_writes")
section_template_collection = mongo_client(database="dpu_care", collection="section_template")
history_template_collection = mongo_client(database="dpu_care", collection="history_template")
