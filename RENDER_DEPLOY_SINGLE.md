# Render.com ga Birgalikda Deploy qilish

Frontend va Backend bitta service sifatida deploy qilinadi.

## 1. MongoDB Atlas sozlash (bepul)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) ga ro'yxatdan o'ting
2. Yangi cluster yarating (FREE tier)
3. Database User yarating (username va password)
4. Network Access: "Allow Access from Anywhere" (0.0.0.0/0)
5. Connection string oling

## 2. Render.com da Deploy qilish

### Bitta Web Service yaratish:

1. [Render.com](https://render.com) ga kiring
2. "New +" → "Web Service"
3. GitHub repository ni ulang
4. Sozlamalar:

**Basic Settings:**
- **Name:** `telegram-clone`
- **Region:** Oregon (US West)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Environment:** Node
- **Plan:** Free

**Build & Deploy:**
- **Build Command:** 
  ```
  npm install && cd ../frontend && npm install && npm run build && cd ../backend
  ```

- **Start Command:**
  ```
  npm start
  ```

**Environment Variables:**

Quyidagi 6 ta variable qo'shing:

1. `NODE_ENV`
   ```
   production
   ```

2. `PORT`
   ```
   10000
   ```

3. `MONGODB_URI`
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/telegram_clone?retryWrites=true&w=majority
   ```
   ☝️ MongoDB Atlas dan oling

4. `JWT_SECRET`
   ```
   kj34h5kjh34k5jh3k4j5h3k4j5h3k4j5h3k4j5h
   ```
   ☝️ 32+ belgili tasodifiy string

5. `JWT_EXPIRES_IN`
   ```
   30d
   ```

6. `BCRYPT_ROUNDS`
   ```
   10
   ```

**FRONTEND_URL kerak emas** - chunki bitta domain da ishlaydi!

5. "Create Web Service" bosing

## 3. Deploy jarayoni

1. Build 3-5 daqiqa davom etadi
2. Deploy tugagach URL olasiz: `https://telegram-clone.onrender.com`
3. Shu URL orqali frontend va backend ishlaydi

## 4. Tekshirish

- Frontend: `https://telegram-clone.onrender.com`
- Backend API: `https://telegram-clone.onrender.com/api`
- Health check: `https://telegram-clone.onrender.com/health`

## 5. Frontend .env sozlash (local development uchun)

Agar local da ishlamoqchi bo'lsangiz:

`frontend/.env`:
```
VITE_API_URL=https://telegram-clone.onrender.com/api
```

Yoki local backend bilan:
```
VITE_API_URL=http://localhost:5000/api
```

## Afzalliklari:

✅ Bitta URL - oson boshqarish  
✅ CORS muammolari yo'q  
✅ Bitta service - bepul plan yetadi  
✅ Frontend va backend bir vaqtda deploy bo'ladi  

## Muammolar:

**Build xatosi:**
- Logs ni tekshiring
- `npm install` ikkalasida ham ishlayotganini tekshiring

**Frontend ko'rinmasa:**
- `frontend/dist` papka yaratilganini tekshiring
- `NODE_ENV=production` ekanini tekshiring

**Backend API ishlamasa:**
- Environment variables to'g'ri kiritilganini tekshiring
- MongoDB connection string to'g'ri ekanini tekshiring
- Logs: Service → Logs

## Eslatma:

Free plan: 15 daqiqa faoliyatsizlikdan keyin uyqu rejimiga o'tadi. Birinchi so'rov 30-50 soniya olishi mumkin (cold start).
