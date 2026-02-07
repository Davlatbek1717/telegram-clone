# Render.com ga Deploy qilish

## 1. MongoDB Atlas sozlash (bepul)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) ga ro'yxatdan o'ting
2. Yangi cluster yarating (FREE tier)
3. Database User yarating (username va password)
4. Network Access: "Allow Access from Anywhere" (0.0.0.0/0)
5. Connection string oling: `mongodb+srv://username:password@cluster.mongodb.net/telegram_clone`

## 2. Backend Deploy qilish

### Render.com da:

1. [Render.com](https://render.com) ga kiring
2. "New +" → "Web Service"
3. GitHub repository ni ulang
4. Sozlamalar:
   - **Name:** `telegram-clone-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Environment Variables qo'shing:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram_clone
   JWT_SECRET=your_random_32_character_secret_key_here
   JWT_EXPIRES_IN=30d
   BCRYPT_ROUNDS=10
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

6. "Create Web Service" bosing

## 3. Frontend Deploy qilish

### Render.com da:

1. "New +" → "Static Site"
2. GitHub repository ni ulang
3. Sozlamalar:
   - **Name:** `telegram-clone-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Environment Variables:
   ```
   VITE_API_URL=https://telegram-clone-backend.onrender.com/api
   ```

5. "Create Static Site" bosing

## 4. Backend Environment ni yangilash

Backend deploy bo'lgandan keyin:

1. Backend service → Settings → Environment
2. `FRONTEND_URL` ni yangilang: `https://telegram-clone-frontend.onrender.com`
3. "Save Changes" → Service avtomatik qayta deploy bo'ladi

## 5. Tekshirish

1. Frontend URL: `https://telegram-clone-frontend.onrender.com`
2. Backend Health: `https://telegram-clone-backend.onrender.com/health`
3. Register va Login qiling

## Muhim eslatmalar:

- Free plan: 15 daqiqa faoliyatsizlikdan keyin uyqu rejimiga o'tadi
- Birinchi so'rov 30-50 soniya olishi mumkin (cold start)
- MongoDB Atlas ham bepul (512MB)
- HTTPS avtomatik yoqiladi

## Muammolar:

**Backend ishlamasa:**
- Logs ni tekshiring: Backend service → Logs
- Environment variables to'g'ri kiritilganini tekshiring
- MongoDB connection string to'g'ri ekanini tekshiring

**Frontend backend ga ulanmasa:**
- `VITE_API_URL` to'g'ri backend URL ekanini tekshiring
- Backend CORS sozlamalari to'g'ri ekanini tekshiring
- Browser console da xatolarni tekshiring
