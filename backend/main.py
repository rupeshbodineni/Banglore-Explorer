import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import socketio
from dotenv import load_dotenv

# Load env variables
load_dotenv()

from routes import auth, places, reviews

app = FastAPI(title="Bangalore Explorer API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In production, restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(places.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")

@app.get("/")
async def root():
    return PlainTextResponse("API is running...")

# Socket.io setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Map to keep track of viewers per place: place_id -> set of sids
place_viewers = {}

async def handle_leave(sid):
    current_room = None
    try:
        async with sio.session(sid) as session:
            current_room = session.get('current_room')
    except Exception:
        pass
        
    if current_room and current_room in place_viewers:
        viewers = place_viewers[current_room]
        if sid in viewers:
            viewers.remove(sid)
        
        # Broadcast updated viewer count to everyone in the room
        await sio.emit('viewers_update', len(viewers), room=current_room)
        
        # If no one is viewing, clean up
        if len(viewers) == 0:
            place_viewers.pop(current_room, None)
            
        try:
            await sio.leave_room(sid, current_room)
        except Exception:
            pass
            
        try:
            async with sio.session(sid) as session:
                session['current_room'] = None
        except Exception:
            pass

@sio.event
async def connect(sid, environ):
    print(f"User connected: {sid}")

@sio.on('join_place')
async def on_join_place(sid, place_id):
    # Ensure client leaves any previous room
    await handle_leave(sid)
    
    await sio.enter_room(sid, place_id)
    async with sio.session(sid) as session:
        session['current_room'] = place_id
        
    if place_id not in place_viewers:
        place_viewers[place_id] = set()
    place_viewers[place_id].add(sid)
    
    # Broadcast updated viewer count to everyone in the room
    await sio.emit('viewers_update', len(place_viewers[place_id]), room=place_id)

@sio.on('new_review')
async def on_new_review(sid, data):
    # data should contain { 'placeId', 'review' }
    place_id = data.get('placeId')
    review = data.get('review')
    if place_id and review:
        await sio.emit('review_added', review, room=place_id)

@sio.on('leave_place')
async def on_leave_place(sid):
    await handle_leave(sid)

@sio.event
async def disconnect(sid):
    print(f"User disconnected: {sid}")
    await handle_leave(sid)

# Wrap FastAPI app with Socket.io ASGIApp
sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("main:sio_app", host="0.0.0.0", port=port, reload=True)
