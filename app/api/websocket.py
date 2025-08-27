from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from ..websocket_manager import manager
from ..auth import get_current_user_from_token
from ..models import UserRole

router = APIRouter()

@router.websocket("/ws/{user_type}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_type: str,
    user_id: int
):
    if user_type not in ["clients", "workers", "admins"]:
        await websocket.close(code=4000, reason="Invalid user type")
        return
    
    await manager.connect(websocket, user_type, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message({
                "type": "message",
                "content": f"Message received: {data}"
            }, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_type)

@router.websocket("/ws/auth/{token}")
async def websocket_auth_endpoint(
    websocket: WebSocket,
    token: str
):
    try:
        user = await get_current_user_from_token(token)
        user_type = f"{user.role.value}s"
        
        await manager.connect(websocket, user_type, user.id)
        
        try:
            while True:
                data = await websocket.receive_text()
                await manager.send_personal_message({
                    "type": "message",
                    "content": f"Message received: {data}"
                }, websocket)
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_type)
            
    except Exception as e:
        await websocket.close(code=4001, reason="Authentication failed")
