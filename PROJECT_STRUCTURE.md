# Marketplace Project Structure

```
marketplace/
├── 📁 app/                          # Main application package
│   ├── 📁 api/                      # API endpoints
│   │   ├── auth.py                  # Authentication endpoints
│   │   ├── users.py                 # User management (admin)
│   │   ├── services.py              # Service management
│   │   ├── orders.py                # Order management
│   │   └── websocket.py             # WebSocket endpoints
│   ├── auth.py                      # Authentication utilities
│   ├── config.py                    # Configuration settings
│   ├── crud.py                      # Database operations
│   ├── database.py                  # Database connection
│   ├── main.py                      # FastAPI application
│   ├── models.py                    # Database models
│   ├── payment.py                   # Payment processing
│   ├── schemas.py                   # Pydantic schemas
│   └── websocket_manager.py         # WebSocket management
├── 📁 alembic/                      # Database migrations
│   ├── env.py                       # Migration environment
│   └── script.py.mako               # Migration template
├── alembic.ini                      # Alembic configuration
├── env.example                      # Environment variables template
├── init_db.py                       # Database initialization
├── README.md                        # Project documentation
├── requirements.txt                  # Python dependencies
├── run.py                           # Application runner
├── start.sh                         # Setup script
├── test_setup.py                    # Setup verification
└── PROJECT_STRUCTURE.md             # This file
```

## 🔑 Key Components

### **Authentication & Security**
- **JWT tokens** with configurable expiry
- **Role-based access control** (Client, Worker, Admin)
- **Password hashing** with bcrypt
- **Secure token validation**

### **Database Layer**
- **SQLAlchemy ORM** with PostgreSQL
- **Alembic migrations** for schema management
- **CRUD operations** for all entities
- **Relationship management** between models

### **Payment System**
- **Stripe integration** for card processing
- **Payment intent creation** and management
- **Order status updates** based on payment
- **Error handling** for payment failures

### **Real-time Communication**
- **WebSocket connections** for each user role
- **Real-time notifications** for orders and payments
- **Connection management** with automatic cleanup
- **Role-based broadcasting**

### **API Endpoints**
- **RESTful design** with proper HTTP methods
- **Input validation** using Pydantic schemas
- **Error handling** with appropriate HTTP status codes
- **Comprehensive documentation** with Swagger/OpenAPI

## 🚀 Getting Started

1. **Setup**: `./start.sh`
2. **Configure**: Edit `.env` file
3. **Initialize DB**: `python init_db.py`
4. **Run**: `python run.py`
5. **Test**: Visit `http://localhost:8000/docs`

## 🔐 Sample Users

- **Admin**: `admin/admin123`
- **Worker**: `worker1/worker123`
- **Client**: `client1/client123`

## 💡 Architecture Highlights

- **Modular design** with clear separation of concerns
- **Dependency injection** for database and authentication
- **Async/await** support for WebSocket operations
- **Type hints** throughout the codebase
- **Comprehensive error handling** and validation
