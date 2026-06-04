from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from config.db import db
from middleware.auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/reviews", tags=["reviews"])

class CreateReviewSchema(BaseModel):
    placeId: str
    rating: float
    comment: str

def serialize_review(review, user_info=None):
    if not review:
        return review
    review = dict(review)
    review["_id"] = str(review["_id"])
    review["user"] = str(review["user"])
    review["place"] = str(review["place"])
    if "createdAt" in review and isinstance(review["createdAt"], datetime):
        review["createdAt"] = review["createdAt"].isoformat()
    if "updatedAt" in review and isinstance(review["updatedAt"], datetime):
        review["updatedAt"] = review["updatedAt"].isoformat()
    if user_info:
        review["user"] = user_info
    return review

@router.get("/place/{place_id}")
async def get_reviews(place_id: str):
    try:
        place_obj_id = ObjectId(place_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid place ID format"
        )
        
    cursor = db.reviews.find({"place": place_obj_id})
    reviews = []
    async for doc in cursor:
        user_doc = await db.users.find_one({"_id": doc["user"]}, {"name": 1})
        user_info = {"_id": str(doc["user"]), "name": "Anonymous"}
        if user_doc:
            user_info["name"] = user_doc.get("name", "Anonymous")
            
        reviews.append(serialize_review(doc, user_info))
    return reviews

@router.post("")
async def create_review(body: CreateReviewSchema, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    try:
        place_obj_id = ObjectId(body.placeId)
        user_obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid place or user ID format"
        )
        
    # Check if place exists
    place = await db.places.find_one({"_id": place_obj_id})
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )
        
    # Check if already reviewed
    already_reviewed = await db.reviews.find_one({
        "user": user_obj_id,
        "place": place_obj_id
    })
    
    if already_reviewed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this place"
        )
        
    # Create review
    now = datetime.now(timezone.utc)
    review_data = {
        "user": user_obj_id,
        "place": place_obj_id,
        "rating": float(body.rating),
        "comment": body.comment,
        "createdAt": now,
        "updatedAt": now
    }
    
    result = await db.reviews.insert_one(review_data)
    review_id = result.inserted_id
    
    # Update place reviewsCount and rating
    place_reviews = []
    cursor = db.reviews.find({"place": place_obj_id})
    async for r in cursor:
        place_reviews.append(r)
        
    reviews_count = len(place_reviews)
    avg_rating = sum(r["rating"] for r in place_reviews) / reviews_count if reviews_count > 0 else 0.0
    
    await db.places.update_one(
        {"_id": place_obj_id},
        {"$set": {"reviewsCount": reviews_count, "rating": avg_rating}}
    )
    
    created_review = await db.reviews.find_one({"_id": review_id})
    return serialize_review(created_review)
