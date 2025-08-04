# 🎬 Movie Streaming Platform - Enhanced Edition

A secure, full-stack movie streaming web application built with **React (Tailwind CSS)** for the frontend and **Spring Boot** for the backend. Features secure video streaming, JWT authentication, comprehensive error handling, and production-ready security measures.

[![Security Status](https://img.shields.io/badge/Security-Enhanced-green.svg)](./SECURITY.md)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Features

### Core Features
- 🔐 **Enhanced JWT Authentication** with refresh tokens
- 📺 **Secure Video Streaming** with Range header support and path validation
- ☁️ **Firebase Storage** integration for video hosting
- 🧾 **MySQL Database** with optimized indexes and constraints
- 🛡️ **Comprehensive Security** measures and input validation
- 🎨 **Responsive UI** with Tailwind CSS and Heroicons
- 🔎 **Advanced Search** and filtering capabilities

### Security Features
- ✅ **Input Validation** on all endpoints
- ✅ **Global Exception Handling** with structured error responses
- ✅ **Path Traversal Protection** for file operations
- ✅ **Environment Variable Configuration** for sensitive data
- ✅ **Profile-based Security** (development endpoints restricted)
- ✅ **Database Optimization** with indexes and constraints
- ✅ **Comprehensive Logging** throughout the application

### User Features
- 👤 **User Registration & Authentication**
- 🎭 **Admin Dashboard** for content management
- ❤️ **Favorites & Watch Later** lists
- 📚 **Watch History** tracking
- 💬 **Movie Comments** and ratings
- 🔄 **Progress Tracking** for video playback

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- **React 18** with functional components and hooks
- **Tailwind CSS** for responsive styling
- **Heroicons** for consistent iconography
- **Axios** for API communication
- **React Router** for client-side routing
- **React Hot Toast** for notifications
- **Context API** for state management

### 🧠 Backend
- **Spring Boot 3.5.3** with Java 21
- **Spring Security** with JWT authentication
- **Spring Data JPA** with MySQL
- **Jakarta Bean Validation** for input validation
- **BCrypt** password hashing
- **Comprehensive logging** with SLF4J
- **Global exception handling**

### 🗃️ Database
- **MySQL 8+** with optimized indexes
- **JPA/Hibernate** for ORM
- **Database constraints** and validation
- **Automatic schema generation**

---

## 🗂️ Project Structure

```
/movie-streaming-platform
│
├── /frontend                   # React Frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── /auth          # Authentication components
│   │   │   ├── /common        # Shared components
│   │   │   ├── /movie         # Movie-related components
│   │   │   └── /user          # User-specific components
│   │   ├── /context           # React Context providers
│   │   ├── /hooks             # Custom React hooks
│   │   ├── /pages             # Page components
│   │   ├── /services          # API service layer
│   │   ├── /styles            # CSS and styling
│   │   └── /utils             # Utility functions
│   ├── package.json
│   └── tailwind.config.js
│
├── /movieapi                   # Spring Boot Backend
│   ├── /src/main/java
│   │   ├── /controller        # REST controllers
│   │   ├── /model            # JPA entities
│   │   ├── /repository       # Data repositories
│   │   ├── /service          # Business logic
│   │   ├── /dto              # Data transfer objects
│   │   ├── /config           # Configuration classes
│   │   ├── /security         # Security configuration
│   │   └── /exception        # Exception handling
│   ├── /src/main/resources
│   │   ├── application.properties
│   │   └── /static           # Static resources
│   ├── pom.xml
│   └── .env.example
│
├── setup-dev.sh              # Development setup script
├── SECURITY.md               # Security documentation
└── README.md
```

---

## ⚙️ Quick Start

### 🧑‍💻 Prerequisites

- **Node.js** 16+ and npm
- **Java** 17+ (recommended: Java 21)
- **Maven** 3.6+
- **MySQL** 8.0+
- **Git**

### 🚀 Automated Setup

Run the automated setup script:

```bash
# Clone the repository
git clone <repository-url>
cd movie-streaming-platform

# Run the setup script (Linux/macOS)
./setup-dev.sh

# Or for Windows, run manually:
# See "Manual Setup" section below
```

### 🔧 Manual Setup

#### 1. Environment Configuration

```bash
# Copy environment example
cp movieapi/.env.example movieapi/.env

# Edit the .env file with your configuration
nano movieapi/.env
```

#### 2. Database Setup

```sql
-- Create database and user
mysql -u root -p
CREATE DATABASE moviedb;
CREATE USER 'movieuser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON moviedb.* TO 'movieuser'@'localhost';
FLUSH PRIVILEGES;
exit
```

#### 3. Backend Setup

```bash
cd movieapi

# Install dependencies and compile
mvn clean compile

# Run the application
mvn spring-boot:run
```

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **API Documentation**: http://localhost:8081/swagger-ui.html (if enabled)

---

## 🔐 Security Configuration

### Environment Variables

Create a `.env` file in the `movieapi` directory:

```bash
# JWT Configuration
JWT_SECRET=your-very-long-secure-jwt-secret-key-at-least-512-bits-long-for-hs512-algorithm
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/moviedb?createDatabaseIfNotExist=true
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_db_password

# Server Configuration
SERVER_PORT=8081
SPRING_PROFILES_ACTIVE=development

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000

# File Configuration
VIDEO_DIRECTORY=src/main/resources/static/videos/
UPLOAD_DIR=src/main/resources/static/uploads/
MAX_FILE_SIZE=100MB
```

### Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation on all inputs
- **Path Security**: Protection against path traversal attacks
- **Error Handling**: Secure error responses without data leakage
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Environment Variables**: Externalized configuration for security

For complete security documentation, see [SECURITY.md](./SECURITY.md).

---

## 📝 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Authentication** |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/register-admin` | Admin registration | ❌ |
| POST | `/api/auth/refresh` | Token refresh | ❌ |
| POST | `/api/auth/logout` | User logout | ✅ |
| GET | `/api/auth/validate` | Token validation | ❌ |
| **Movies** |
| GET | `/api/movies` | Get all movies | ❌ |
| GET | `/api/movies/{id}` | Get movie by ID | ❌ |
| POST | `/api/movies` | Create movie | 👑 Admin |
| PUT | `/api/movies/{id}` | Update movie | 👑 Admin |
| DELETE | `/api/movies/{id}` | Delete movie | 👑 Admin |
| **Streaming** |
| GET | `/api/stream/{movieId}` | Stream video | ❌ |
| POST | `/api/stream/progress` | Update progress | ✅ |
| POST | `/api/stream/complete/{id}` | Mark completed | ✅ |
| **User Features** |
| GET | `/api/favorites` | Get user favorites | ✅ |
| POST | `/api/favorites/{movieId}` | Add to favorites | ✅ |
| DELETE | `/api/favorites/{movieId}` | Remove from favorites | ✅ |
| GET | `/api/watch-later` | Get watch later list | ✅ |
| POST | `/api/watch-later/{movieId}` | Add to watch later | ✅ |

---

## 🚢 Production Deployment

### Security Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=production`
- [ ] Use strong, unique JWT secrets (512+ bits)
- [ ] Configure HTTPS with SSL certificates
- [ ] Set up database with restricted user permissions
- [ ] Configure firewall rules
- [ ] Enable security headers
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individually
docker build -t movie-api ./movieapi
docker build -t movie-frontend ./frontend
```

### Traditional Deployment

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Package Backend**:
   ```bash
   cd movieapi
   mvn clean package -Dmaven.test.skip=true
   ```

3. **Deploy**: Use the generated JAR file and built frontend assets

---

## 🧪 Testing

### Backend Tests
```bash
cd movieapi
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
# Install Cypress (if configured)
npm run test:e2e
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow security best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all security checks pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Gihan Pathirana**  
🔗 [GitHub Profile](https://github.com/mrgihan)

---

## 🙏 Acknowledgments

- Spring Boot community
- React community
- Security research community
- Open source contributors

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](link-to-issues)
- 💡 **Feature Requests**: [GitHub Discussions](link-to-discussions)
- 🔒 **Security Issues**: See [SECURITY.md](./SECURITY.md)
- 📧 **Contact**: [your-email@domain.com]

---

<div align="center">

**⭐ If you find this project helpful, please give it a star! ⭐**

Made with ❤️ and ☕

</div>