#!/bin/bash

# Movie Streaming Platform - Development Setup Script
# This script helps set up the development environment

set -e  # Exit on any error

echo "🎬 Movie Streaming Platform - Development Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Java
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    print_success "Java found: $JAVA_VERSION"
else
    print_error "Java not found. Please install Java 17 or higher."
    exit 1
fi

# Check Maven
if command_exists mvn; then
    MVN_VERSION=$(mvn -version | head -n 1)
    print_success "Maven found: $MVN_VERSION"
else
    print_error "Maven not found. Please install Maven."
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 16 or higher."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check MySQL
if command_exists mysql; then
    MYSQL_VERSION=$(mysql --version | head -n 1)
    print_success "MySQL found: $MYSQL_VERSION"
else
    print_warning "MySQL not found. Please install MySQL 8.0 or higher."
fi

echo ""

# Setup environment file
print_status "Setting up environment configuration..."

if [ ! -f "movieapi/.env" ]; then
    if [ -f "movieapi/.env.example" ]; then
        cp movieapi/.env.example movieapi/.env
        print_success "Created .env file from .env.example"
        print_warning "Please update the .env file with your actual configuration values!"
    else
        print_warning ".env.example not found. Please create .env file manually."
    fi
else
    print_warning ".env file already exists. Skipping creation."
fi

echo ""

# Setup backend
print_status "Setting up backend dependencies..."
cd movieapi

if mvn clean compile > /dev/null 2>&1; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

# Setup frontend
print_status "Setting up frontend dependencies..."
cd frontend

if npm install > /dev/null 2>&1; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""

# Create necessary directories
print_status "Creating necessary directories..."

mkdir -p movieapi/src/main/resources/static/videos
mkdir -p movieapi/src/main/resources/static/uploads
mkdir -p movieapi/logs

print_success "Directories created successfully"

echo ""

# Database setup instructions
print_status "Database Setup Instructions:"
echo "1. Start your MySQL server"
echo "2. Create database and user:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE moviedb;"
echo "   CREATE USER 'movieuser'@'localhost' IDENTIFIED BY 'moviepass';"
echo "   GRANT ALL PRIVILEGES ON moviedb.* TO 'movieuser'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   exit"
echo ""

# Final instructions
print_success "Development environment setup completed!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd movieapi"
echo "   mvn spring-boot:run"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open your browser and navigate to:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8081"
echo ""
echo "📝 Important Notes:"
echo "- Update the .env file with your actual database credentials"
echo "- Make sure MySQL is running before starting the backend"
echo "- The backend will automatically create database tables on first run"
echo ""
echo "🔧 For production deployment:"
echo "- Set SPRING_PROFILES_ACTIVE=production"
echo "- Use environment variables for all sensitive configuration"
echo "- Set up proper SSL certificates"
echo "- Configure a reverse proxy (nginx)"
echo ""

print_success "Happy coding! 🎉"