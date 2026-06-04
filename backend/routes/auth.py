from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from config.db import db
from middleware.auth import get_current_user, hash_password, verify_password, generate_token

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(body: RegisterSchema):
    # Check if user already exists
    user_exists = await db.users.find_one({"email": body.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Hash password
    hashed_pwd = hash_password(body.password)
    
    # Create user
    user_data = {
        "name": body.name,
        "email": body.email,
        "password": hashed_pwd,
        "role": "user",
        "favorites": []
    }
    
    result = await db.users.insert_one(user_data)
    user_id = result.inserted_id
    
    user = await db.users.find_one({"_id": user_id})
    if user:
        return {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "favorites": user["favorites"],
            "token": generate_token(str(user["_id"]))
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user data"
        )

@router.post("/login")
async def login(body: LoginSchema):
    user = await db.users.find_one({"email": body.email})
    
    if user and verify_password(body.password, user.get("password", "")):
        return {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "favorites": [str(f) for f in user.get("favorites", [])],
            "token": generate_token(str(user["_id"]))
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Populate favorites
    favorites_ids = user.get("favorites", [])
    populated_favorites = []
    for fid in favorites_ids:
        try:
            place = await db.places.find_one({"_id": ObjectId(fid)})
            if place:
                place["_id"] = str(place["_id"])
                populated_favorites.append(place)
        except Exception:
            pass
            
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    user["favorites"] = populated_favorites
    return user

@router.post("/favorites/{place_id}")
async def toggle_favorite(place_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    favorites = user.get("favorites", [])
    
    try:
        place_obj_id = ObjectId(place_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid place ID format"
        )
        
    # Check if place exists
    place_exists = await db.places.find_one({"_id": place_obj_id})
    if not place_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )
        
    # Check if the place_obj_id is in favorites. 
    # Mongoose saves as ObjectId, but in python it could be ObjectId or string.
    # We will normalize favorites to ObjectIds for the check.
    fav_object_ids = []
    for f in favorites:
        try:
            fav_object_ids.append(ObjectId(f))
        except Exception:
            pass
            
    if place_obj_id in fav_object_ids:
        fav_object_ids = [f for f in fav_object_ids if f != place_obj_id]
    else:
        fav_object_ids.append(place_obj_id)
        
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"favorites": fav_object_ids}}
    )
    
    # Fetch and populate favorites
    populated_favorites = []
    for fid in fav_object_ids:
        place = await db.places.find_one({"_id": fid})
        if place:
            place["_id"] = str(place["_id"])
            populated_favorites.append(place)
            
    return populated_favorites
