# Telegram Clone

Real-time messaging application with React, Node.js, Express, and Socket.IO.

## ✨ Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Real-time Messaging (WebSocket with Socket.IO)
- ✅ Private Chats & Group Chats
- ✅ User Search (name, username, email, phone)
- ✅ Profile Management (update info and photo)
- ✅ Typing Indicators & Online/Offline Status
- ✅ Message Read Receipts (✓ sent, ✓✓ read)
- ✅ Settings Page & Group Creation

## 🛠 Tech Stack

**Frontend:** React 18, React Router, Socket.IO Client, Axios, Formik & Yup  
**Backend:** Node.js, Express, Socket.IO, JWT, Bcrypt, In-Memory DB

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Git

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend API URL
npm run dev
```

## 🚀 Deployment

### Option 1: Single Service (Recommended)
Deploy frontend and backend together as one service. See [RENDER_DEPLOY_SINGLE.md](./RENDER_DEPLOY_SINGLE.md)

**Render.com Settings:**
- **Root Directory:** `backend`
- **Build Command:** `npm install && cd ../frontend && npm install && npm run build && cd ../backend`
- **Start Command:** `npm start`

### Option 2: Separate Services
Deploy frontend and backend separately. See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

## 🚀 Usage

1. Register with phone, email, and password
2. Login and search for users
3. Create private chats or groups
4. Send real-time messages

## 👨‍💻 Author

Davlatbek Teshaev (@davlatbek1717)

## 📄 License

MIT
