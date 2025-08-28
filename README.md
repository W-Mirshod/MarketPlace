# 🚀 Marketplace Full-Stack Project

A complete, production-ready marketplace platform featuring a **FastAPI backend** and **React frontend** with modern authentication, payment processing, real-time communication, and comprehensive order management.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Client    │ │   Worker    │ │    Admin    │          │
│  │   Portal    │ │   Portal    │ │   Portal    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│           │              │              │                  │
│           └──────────────┼──────────────┘                  │
│                          │                                 │
│                    WebSocket Connection                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Auth     │ │   Payment   │ │   Orders    │          │
│  │   & JWT     │ │   Stripe    │ │ Management  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│           │              │              │                  │
│           └──────────────┼──────────────┘                  │
│                          │                                 │
│                    PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### 🔐 **Authentication & Security**
- **JWT-based authentication** with secure token management
- **Role-based access control** (Client, Worker, Admin)
- **Password hashing** with bcrypt
- **Protected routes** and API endpoints
- **Session management** with automatic token refresh

### 💳 **Payment System**
- **Stripe integration** for secure card processing
- **Payment intent creation** and management
- **Order status updates** based on payment status
- **Fake payment system** for development/testing
- **Payment confirmation** and cancellation handling

### 🔌 **Real-time Communication**
- **WebSocket connections** for live updates
- **Real-time notifications** for new orders
- **Order acceptance** notifications for clients
- **Payment status updates** via WebSocket
- **Role-based broadcasting** system

### 📋 **Order Management**
- **Complete order lifecycle** from creation to completion
- **Role-based order visibility** and management
- **Order status tracking** (pending, paid, completed, canceled)
- **Worker assignment** and order acceptance
- **Order history** and analytics

### 👥 **User Management**
- **User registration** with role selection
- **Profile management** and updates
- **Admin user monitoring** and control
- **User deactivation** and status management
- **Role-based permissions** and access control

## 🛠️ Technology Stack

### **Backend (FastAPI)**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **Alembic** - Database migrations
- **JWT** - JSON Web Tokens for authentication
- **WebSockets** - Real-time communication
- **Stripe** - Payment processing
- **Pydantic** - Data validation and serialization

### **Frontend (React)**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant forms with validation

## 📁 Project Structure

```
marketplace/
├── 📁 app/                          # FastAPI backend
│   ├── 📁 api/                      # API endpoints
│   │   ├── auth.py                  # Authentication
│   │   ├── users.py                 # User management
│   │   ├── services.py              # Service management
│   │   ├── orders.py                # Order management
│   │   └── websocket.py             # WebSocket endpoints
│   ├── auth.py                      # Auth utilities
│   ├── config.py                    # Configuration
│   ├── crud.py                      # Database operations
│   ├── database.py                  # Database connection
│   ├── main.py                      # FastAPI application
│   ├── models.py                    # Database models
│   ├── payment.py                   # Payment processing
│   ├── schemas.py                   # Pydantic schemas
│   └── websocket_manager.py         # WebSocket management
├── 📁 frontend/                     # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/           # UI components
│   │   ├── 📁 pages/                # Page components
│   │   ├── 📁 stores/               # State management
│   │   ├── 📁 lib/                  # Utilities
│   │   ├── 📁 types/                # TypeScript types
│   │   ├── App.tsx                  # Main app
│   │   └── main.tsx                 # Entry point
│   ├── package.json                 # Dependencies
│   ├── tailwind.config.js           # Tailwind config
│   └── vite.config.ts               # Vite config
├── 📁 alembic/                      # Database migrations
├── requirements.txt                  # Python dependencies
├── start-full-stack.sh              # Full setup script
├── start.sh                         # Backend setup
├── init_db.py                       # Database initialization
└── README.md                        # Project documentation
```

## 🚀 Quick Start

### **1. One-Command Setup**
```bash
./start-full-stack.sh
```

### **2. Manual Setup**

#### **Backend Setup**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your settings

# Initialize database
python init_db.py

# Start backend
python run.py
```

#### **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **3. Access Points**
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

## 🔐 Sample Accounts

| Role | Username | Password | Access |
|------|----------|----------|---------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Worker** | `worker1` | `worker123` | Order management |
| **Client** | `client1` | `client123` | Service ordering |

## 📊 API Endpoints

### **Authentication**
- `POST /auth/register` - User registration
- `POST /auth/token` - User login
- `GET /auth/me` - Get current user

### **Users (Admin)**
- `GET /users/` - List all users
- `GET /users/{id}` - Get specific user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Deactivate user

### **Services**
- `GET /services/` - List all services
- `GET /services/{id}` - Get specific service
- `POST /services/` - Create service (Admin)
- `PUT /services/{id}` - Update service (Admin)
- `DELETE /services/{id}` - Deactivate service (Admin)

### **Orders**
- `POST /orders/` - Create order (Client)
- `GET /orders/` - Get orders (role-based)
- `GET /orders/{id}` - Get specific order
- `PUT /orders/{id}/accept` - Accept order (Worker)
- `PUT /orders/{id}/complete` - Complete order (Worker)

### **Payments**
- `POST /orders/{id}/payment` - Create payment
- `POST /orders/{id}/payment/confirm` - Confirm payment
- `POST /orders/{id}/payment/cancel` - Cancel payment

### **WebSocket**
- `/ws/{user_type}/{user_id}` - Role-based connections
- `/ws/auth/{token}` - Authenticated connections

## 🎨 Frontend Features

### **Responsive Design**
- **Mobile-first** approach
- **Breakpoint system** for all screen sizes
- **Touch-friendly** interactions
- **Consistent spacing** and typography

### **Component Library**
- **Reusable UI components** with consistent styling
- **Form components** with validation
- **Data tables** with sorting and filtering
- **Modal dialogs** and overlays
- **Toast notifications** for user feedback

### **State Management**
- **Zustand stores** for global state
- **React Query** for server state
- **Local storage** for persistence
- **Real-time updates** via WebSocket

## 🔒 Security Features

### **Backend Security**
- **JWT token validation** with expiration
- **Password hashing** using bcrypt
- **Role-based access control** at API level
- **Input validation** with Pydantic
- **SQL injection protection** with SQLAlchemy

### **Frontend Security**
- **Protected routes** with authentication checks
- **Token storage** in secure localStorage
- **Automatic logout** on token expiration
- **Role-based UI rendering**
- **Form validation** and sanitization

## 📈 Performance Features

### **Backend Performance**
- **Async/await** support throughout
- **Database connection pooling**
- **Query optimization** with SQLAlchemy
- **Caching** capabilities (ready for Redis)
- **Background task** support

### **Frontend Performance**
- **Code splitting** with React Router
- **Lazy loading** of components
- **Optimized builds** with Vite
- **Efficient state updates** with Zustand
- **Debounced search** and filtering

## 🧪 Testing & Quality

### **Code Quality**
- **TypeScript** for type safety
- **ESLint** configuration for code standards
- **Prettier** for code formatting
- **Consistent naming** conventions
- **Error handling** throughout

### **Testing Ready**
- **Unit test** structure ready
- **Integration test** setup prepared
- **API testing** with FastAPI TestClient
- **Frontend testing** with React Testing Library

## 🚀 Deployment Ready

### **Backend Deployment**
- **Docker** support ready
- **Environment configuration** system
- **Database migration** scripts
- **Production settings** configuration
- **Health check** endpoints

### **Frontend Deployment**
- **Build optimization** with Vite
- **Static file serving** ready
- **Environment variable** support
- **CDN deployment** compatible
- **Progressive Web App** ready

## 🔧 Customization

### **Adding New Features**
1. **Backend**: Add models, schemas, and API endpoints
2. **Frontend**: Create components and pages
3. **Database**: Create and run migrations
4. **Testing**: Add unit and integration tests

### **Styling Changes**
1. **Tailwind config** for theme modifications
2. **Component variants** for different styles
3. **CSS custom properties** for dynamic theming
4. **Responsive design** adjustments

## 🆘 Support & Troubleshooting

### **Common Issues**
- **Database connection** - Check PostgreSQL status
- **Port conflicts** - Verify 8000 and 3000 availability
- **Dependencies** - Clear and reinstall packages
- **Environment** - Verify .env configuration

### **502 Bad Gateway Errors**
If you encounter 502 errors when accessing the marketplace API:
- **Check**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions
- **Common cause**: Caddy reverse proxy cannot connect to backend
- **Quick fix**: Update Caddyfile to use host IP instead of localhost

### **Getting Help**
- **API Documentation**: http://localhost:8000/docs
- **Frontend README**: frontend/README.md
- **Backend README**: README.md
- **Project Structure**: PROJECT_STRUCTURE.md
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🎯 Next Steps

### **Immediate Enhancements**
- [ ] **Email notifications** for order updates
- [ ] **File upload** for service attachments
- [ ] **Rating system** for completed orders
- [ ] **Search and filtering** improvements
- [ ] **Mobile app** with React Native

### **Advanced Features**
- [ ] **Multi-language** support
- [ ] **Advanced analytics** dashboard
- [ ] **Payment gateway** integration
- [ ] **Real-time chat** between users
- [ ] **Advanced reporting** system

## 📄 License

This project is licensed under the MIT License.
