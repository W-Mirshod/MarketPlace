from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "clients": [],
            "workers": [],
            "admins": []
        }
    
    async def connect(self, websocket: WebSocket, user_type: str, user_id: int):
        await websocket.accept()
        if user_type not in self.active_connections:
            self.active_connections[user_type] = []
        self.active_connections[user_type].append(websocket)
        await self.send_personal_message(
            {"type": "connection", "message": f"Connected as {user_type}"}, 
            websocket
        )
    
    def disconnect(self, websocket: WebSocket, user_type: str):
        if user_type in self.active_connections:
            self.active_connections[user_type].remove(websocket)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except:
            pass
    
    async def broadcast_to_role(self, message: dict, role: str):
        if role in self.active_connections:
            for connection in self.active_connections[role]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    self.active_connections[role].remove(connection)
    
    async def send_to_user(self, message: dict, user_type: str, user_id: int):
        if user_type in self.active_connections:
            for connection in self.active_connections[user_type]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    self.active_connections[user_type].remove(connection)
    
    async def notify_new_order(self, order_data: dict):
        await self.broadcast_to_role({
            "type": "new_order",
            "data": order_data
        }, "workers")
    
    async def notify_order_accepted(self, order_data: dict, client_id: int):
        await self.broadcast_to_role({
            "type": "order_accepted",
            "data": order_data
        }, "clients")
    
    async def notify_payment_status(self, order_data: dict, client_id: int):
        await self.broadcast_to_role({
            "type": "payment_status",
            "data": order_data
        }, "clients")

manager = ConnectionManager()
