# Marketplace Frontend

A modern, responsive React frontend for the Marketplace platform built with TypeScript, Tailwind CSS, and modern React patterns.

## 🚀 Features

### **Modern UI/UX**
- **Responsive design** that works on all devices
- **Dark/light mode** support with Tailwind CSS
- **Smooth animations** and transitions
- **Professional design** with consistent spacing and typography

### **Authentication & Authorization**
- **JWT-based authentication** with secure token storage
- **Role-based access control** (Client, Worker, Admin)
- **Protected routes** with automatic redirects
- **Persistent login** state management

### **Real-time Features**
- **WebSocket integration** for live notifications
- **Real-time order updates** for workers and clients
- **Payment status notifications** via WebSocket
- **Live dashboard updates**

### **Advanced Components**
- **Form validation** with React Hook Form
- **Data fetching** with React Query
- **State management** with Zustand
- **Toast notifications** for user feedback

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant forms with validation
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API communication
- **Docker** - Containerization

## 📋 Prerequisites

- **Node.js 18+** and npm (for local development)
- **Docker & Docker Compose** (for containerized deployment)
- **FastAPI backend** running on port 8000
- **Modern browser** with ES2020 support

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **From marketplace root directory**
   ```bash
   cd marketplace
   ./docker-start.sh
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Option 2: Local Development

1. **Setup Frontend**
   ```bash
   cd frontend
   ./start.sh
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Visit `http://localhost:3000`

## 🐳 Docker Setup

### Frontend Container

The frontend is containerized with:
- **Multi-stage build** for optimization
- **Nginx** for serving static files
- **API proxy** to backend service
- **Gzip compression** and caching

### Docker Commands

```bash
# Build frontend only
docker build -t marketplace-frontend ./frontend

# Run frontend container
docker run -p 3000:80 marketplace-frontend

# View logs
docker logs marketplace-frontend

# Access container shell
docker exec -it marketplace-frontend sh
```

## 🌐 Subdomain Setup (w-mirshod.com)

### Reverse Proxy Configuration

For production deployment on `marketplace.w-mirshod.com`:

```nginx
server {
    listen 80;
    server_name marketplace.w-mirshod.com;
    
    location / {
        proxy_pass http://marketplace-frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://marketplace-backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment Variables

For production, set these environment variables:

```env
VITE_API_URL=https://marketplace.w-mirshod.com/api
NODE_ENV=production
```

## 📁 Project Structure

```
frontend/
├── 📁 src/
│   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 ui/             # Base UI components
│   │   ├── Layout.tsx         # Main layout with navigation
│   │   └── ProtectedRoute.tsx # Route protection component
│   ├── 📁 pages/              # Page components
│   │   ├── LoginPage.tsx      # Authentication
│   │   ├── DashboardPage.tsx  # Main dashboard
│   │   ├── ServicesPage.tsx   # Service browsing
│   │   ├── OrdersPage.tsx     # Order management
│   │   ├── AdminPage.tsx      # Admin panel
│   │   └── ProfilePage.tsx    # User profile
│   ├── 📁 stores/             # State management
│   │   └── authStore.ts       # Authentication state
│   ├── 📁 lib/                # Utilities and services
│   │   └── api.ts             # API client
│   ├── 📁 types/              # TypeScript type definitions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles
├── 📁 dist/                   # Production build (generated)
├── Dockerfile                 # Container configuration
├── nginx.conf                 # Nginx configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── start.sh                   # Setup script
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Blue shades for main actions and branding
- **Success**: Green for positive states
- **Warning**: Yellow for caution states
- **Danger**: Red for error states
- **Neutral**: Gray shades for text and borders

### **Typography**
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Scale**: Consistent spacing using Tailwind's scale

### **Components**
- **Buttons**: Multiple variants (primary, secondary, danger, outline)
- **Cards**: Flexible card components with shadows and borders
- **Forms**: Consistent input styling with validation states
- **Tables**: Responsive data tables with sorting and filtering

## 🔐 Authentication Flow

1. **Login/Register** → JWT token received
2. **Token stored** in localStorage and Zustand store
3. **Protected routes** check authentication state
4. **API requests** include token in Authorization header
5. **Automatic logout** on token expiration

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Flexible layouts** that adapt to screen size
- **Touch-friendly** interactions on mobile devices

## 🔌 API Integration

- **RESTful API** communication with FastAPI backend
- **Automatic error handling** and user feedback
- **Request/response interceptors** for authentication
- **Real-time updates** via WebSocket connections
- **Production proxy** through nginx configuration

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Docker
docker build -t marketplace-frontend .  # Build container
docker run -p 3000:80 marketplace-frontend  # Run container

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Environment Configuration

### Development
The frontend automatically proxies API requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### Production
For production, the nginx configuration handles API proxying:

```nginx
location /api/ {
    proxy_pass http://marketplace-backend:8000/;
    # ... proxy headers
}
```

## 🔧 Customization

### **Adding New Pages**
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Layout.tsx`

### **Adding New Components**
1. Create component in `src/components/`
2. Export from component index
3. Import and use in pages

### **Styling Changes**
1. Modify `src/index.css` for global styles
2. Update `tailwind.config.js` for theme changes
3. Use Tailwind classes for component-specific styling

### **Nginx Configuration**
1. Modify `nginx.conf` for custom routing
2. Add security headers as needed
3. Configure caching and compression

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Build & Deployment

### **Development Build**
```bash
npm run build
```

### **Docker Production**
```bash
# Build container
docker build -t marketplace-frontend .

# Run container
docker run -d -p 3000:80 --name marketplace-frontend marketplace-frontend

# With docker-compose
docker-compose up -d marketplace-frontend
```

### **Production Deployment**
1. Build the project: `npm run build`
2. Build Docker container: `docker build -t marketplace-frontend .`
3. Deploy container to production server
4. Configure reverse proxy for domain routing

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test on multiple devices and screen sizes
5. Update documentation for new features

## 🐛 Troubleshooting

### **Common Issues**

1. **Backend Connection Failed**
   - Ensure FastAPI backend is running on port 8000
   - Check network connectivity and firewall settings
   - Verify nginx proxy configuration

2. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check for CSS conflicts in browser dev tools
   - Ensure build process includes all CSS files

4. **Docker Issues**
   - Check container logs: `docker logs marketplace-frontend`
   - Verify network connectivity between containers
   - Ensure proper volume mounts and permissions

### **Development Tips**

- Use React DevTools for component debugging
- Check Network tab for API request issues
- Use Console for JavaScript errors and logging
- Monitor WebSocket connections in Network tab
- Check nginx logs for proxy issues

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 📄 License

This project is licensed under the MIT License.
