# 🎬 Movie Streaming Platform

A full-stack movie streaming web application built with **React (Material UI)** for the frontend and **Spring Boot** for the backend. The application supports secure video streaming from **Firebase Storage**, with user authentication, video upload (admin), and playback.

---

## 🚀 Features

- 🔐 **JWT-based Authentication**
- 📺 **Stream MP4 videos** with `Range` header support
- ☁️ **Firebase Storage** integration for video hosting
- 🧾 **MySQL Database** for storing metadata
- 🧑‍💻 **Admin upload** dashboard for movies
- 🎨 Responsive UI with **Material UI**
- 🔎 Search and list movies

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- React
- Material UI
- Axios
- React Router

### 🧠 Backend
- Spring Boot
- Spring Security
- Spring Data JPA
- Firebase Admin SDK
- MySQL
- JWT Authentication

---

## 🗂️ Project Structure

```
/movie-streaming-app
│
├── /client                 # React Frontend
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   └── App.js
│   └── package.json
│
└── /movie-backend          # Spring Boot Backend
    ├── /src/main/java
    │   ├── /controller
    │   ├── /model
    │   ├── /repository
    │   ├── /service
    │   └── /config
    ├── application.properties
    └── pom.xml
```

---

## ⚙️ Getting Started

### 🧑‍💻 Prerequisites

- Node.js & npm
- Java 17+
- MySQL 8 or 9.x
- Docker (optional)
- Firebase project with storage bucket

---

### 🚨 Environment Setup

#### 🔸 Backend (Spring Boot)

1. **Configure MySQL in** `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/moviedb
spring.datasource.username=movieuser
spring.datasource.password=moviepass
```

2. **Set up Firebase Admin SDK**:
   - Download your `serviceAccountKey.json` from Firebase.
   - Place it in `src/main/resources/firebase/`.

3. **Run the backend**:

```bash
cd movie-backend
mvn spring-boot:run
```

#### 🔸 Frontend (React)

1. **Install dependencies**:

```bash
cd client
npm install
```

2. **Run frontend**:

```bash
npm start
```

---

## 🔐 Authentication

- Uses **JWT** for stateless login.
- Credentials are stored securely and sent in headers.
- Role-based authorization (admin/user).

---

## 📦 Deployment

You can deploy the backend using:
- Railway
- Render
- Heroku

And the frontend with:
- Vercel
- Netlify
- Docker + Nginx (advanced)

---

## 📝 API Endpoints Overview

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/auth/login`      | User login               |
| POST   | `/api/auth/register`   | User registration        |
| GET    | `/api/movies`          | Fetch all movies         |
| GET    | `/api/videos/{name}`   | Stream movie by filename |
| POST   | `/api/upload`          | Upload (admin only)      |

---

## 👨‍💻 Author

**Gihan Pathirana**  
🔗 [GitHub Profile](https://github.com/mrgihan)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
