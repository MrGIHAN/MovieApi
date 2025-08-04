# Admin Setup Guide

## Quick Admin Setup

### 1. Backend Setup
The backend is already running on `http://localhost:8081`

### 2. Create Admin User
```bash
curl -X POST http://localhost:8081/api/auth/create-test-admin -H "Content-Type: application/json"
```

This creates an admin user with:
- Email: `admin@test.com`
- Password: `admin123`

### 3. Frontend Setup
The frontend is running on `http://localhost:3000`

### 4. Admin Login
1. Go to `http://localhost:3000/login`
2. Click "Load Test Admin Credentials" button (development mode only)
3. Click "Sign In"

### 5. Access Admin Panel
After login, navigate to:
- Dashboard: `http://localhost:3000/admin`
- Movies: `http://localhost:3000/admin/movies`
- Upload: `http://localhost:3000/admin/upload`
- Users: `http://localhost:3000/admin/users`
- Statistics: `http://localhost:3000/admin/statistics`

## Admin Features

### ✅ Working Features:
- Admin Dashboard with statistics
- User Management
- Movie Upload
- Admin Authentication
- Admin-only routes

### 🔧 Fixed Issues:
- Type mismatch in UserController
- Admin role checking
- Admin user creation
- Admin API endpoints

## Test Admin Credentials
- **Email**: admin@test.com
- **Password**: admin123

## API Endpoints
- Admin Stats: `GET /api/admin/stats`
- Admin Users: `GET /api/admin/users`
- Admin Movies: `POST /api/admin/movies`
- Upload Video: `POST /api/admin/upload/video`
- Upload Image: `POST /api/admin/upload/image` 

