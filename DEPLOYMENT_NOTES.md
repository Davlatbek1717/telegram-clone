# Deployment Notes

## ✅ Backend ishlayapti (Local)

Backend local da to'liq test qilindi:
- ✅ Register API
- ✅ Login API
- ✅ Logout API
- ✅ Profile update
- ✅ Chat creation
- ✅ Message sending
- ✅ WebSocket real-time

## ⚠️ Render.com Muammolari

### 1. Cold Start
Free plan da 15 daqiqa faoliyatsizlikdan keyin server uyqu rejimiga o'tadi. Birinchi so'rov 30-50 soniya olishi mumkin.

**Yechim:** Sahifani yangilang va 30 soniya kuting.

### 2. In-Memory Database
Hozirda in-memory database ishlatilmoqda. Server qayta ishga tushganda barcha ma'lumotlar yo'qoladi.

**Yechim:** MongoDB Atlas ulanishi kerak (Environment variables da MONGODB_URI).

### 3. ERR_CONNECTION_REFUSED
Agar bu xato ko'rinsa - backend hali ishga tushmagan (cold start).

**Yechim:** 
1. Render.com → Service → Logs ni tekshiring
2. Manual Deploy qiling
3. 1-2 daqiqa kuting

## 🚀 Local da ishlatish (Tavsiya etiladi)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**URL:** http://localhost:3000

## 🔧 Render.com da to'g'ri ishlashi uchun

### 1. MongoDB Atlas sozlash
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) ga kiring
2. Free cluster yarating
3. Connection string oling
4. Render.com → Environment → MONGODB_URI ga qo'shing

### 2. Environment Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=32_belgili_tasodifiy_string
JWT_EXPIRES_IN=30d
BCRYPT_ROUNDS=10
```

### 3. Build Settings
- **Root Directory:** `backend`
- **Build Command:** `npm install && cd ../frontend && npm install --include=dev && npm run build && cd ../backend`
- **Start Command:** `npm start`

## 📝 Test Natijalar

### Local (✅ Ishlayapti)
- Register: ✅
- Login: ✅
- Chat: ✅
- Messages: ✅
- WebSocket: ✅

### Render.com (⚠️ Cold start muammosi)
- Backend deploy: ✅
- Frontend build: ✅
- Cold start: ⚠️ 30-50 soniya
- In-memory DB: ⚠️ Ma'lumotlar saqlanmaydi

## 🎯 Tavsiyalar

1. **Local da ishlatish** - Eng yaxshi variant development uchun
2. **MongoDB Atlas** - Production uchun kerak
3. **Paid plan** - Cold start muammosini hal qiladi
4. **Chrome brauzer** - Brave Shields muammosini oldini oladi

## 🐛 Xatolarni hal qilish

### "Xabar yuborishda xatolik"
- Backend ishlamayapti (cold start)
- WebSocket ulanmayapti
- **Yechim:** Sahifani yangilang, 30 soniya kuting

### "ERR_CONNECTION_REFUSED"
- Backend hali ishga tushmagan
- **Yechim:** Render.com logs ni tekshiring

### "Ro'yxatdan o'tishda xatolik"
- Validation xatosi
- Backend ishlamayapti
- **Yechim:** Console da xatoni tekshiring (F12)

## 📞 Support

Agar muammo davom etsa:
1. Browser console ni tekshiring (F12)
2. Network tab da API so'rovlarni ko'ring
3. Render.com logs ni tekshiring
