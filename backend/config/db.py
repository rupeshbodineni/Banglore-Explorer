import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/bangalore_explorer")

# Create MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()
