from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from config.db import db
from middleware.auth import get_admin_user

router = APIRouter(prefix="/places", tags=["places"])

class LocationSchema(BaseModel):
    lat: float
    lng: float

class CreatePlaceSchema(BaseModel):
    name: str
    description: str
    category: str
    location: LocationSchema
    rating: Optional[float] = 0.0
    images: Optional[List[str]] = []
    reviewsCount: Optional[int] = 0
    priceRange: Optional[str] = None

def serialize_place(place):
    if not place:
        return place
    place = dict(place)
    place["_id"] = str(place["_id"])
    return place

@router.get("/utils/categories")
async def get_categories():
    return ['Hotel', 'Bar', 'Cafe', 'Tourist Spot', 'Mall', 'Tech Park', 'Nightlife', 'Restaurant']

@router.get("")
async def get_places(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    minRating: Optional[float] = Query(None)
):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category
    if minRating is not None:
        query["rating"] = {"$gte": minRating}
        
    cursor = db.places.find(query)
    places = []
    async for doc in cursor:
        places.append(serialize_place(doc))
    return places

@router.get("/{place_id}")
async def get_place(place_id: str):
    try:
        obj_id = ObjectId(place_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid place ID format"
        )
        
    place = await db.places.find_one({"_id": obj_id})
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )
    return serialize_place(place)

@router.post("")
async def create_place(body: CreatePlaceSchema, admin_user: dict = Depends(get_admin_user)):
    place_data = body.model_dump()
    
    result = await db.places.insert_one(place_data)
    created_place = await db.places.find_one({"_id": result.inserted_id})
    return serialize_place(created_place)
