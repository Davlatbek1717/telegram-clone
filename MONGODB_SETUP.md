# MongoDB Atlas sozlash (5 daqiqa)

## Nima uchun kerak?

In-memory database server qayta ishga tushganda barcha ma'lumotlarni yo'qotadi. MongoDB Atlas bepul va doimiy saqlash imkonini beradi.

## 1. MongoDB Atlas Account yaratish

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) ga kiring
2. **Sign Up** - Google yoki Email bilan ro'yxatdan o'ting
3. **Create a deployment** tugmasini bosing

## 2. Free Cluster yaratish

1. **Deployment Type:** M0 (FREE) ni tanlang
2. **Provider:** AWS
3. **Region:** Frankfurt (Germany) yoki Mumbai (India) - yaqin joylashgan
4. **Cluster Name:** Cluster0 (default)
5. **Create Deployment** tugmasini bosing

## 3. Database User yaratish

Popup oynada:
1. **Username:** `telegram_user` (yoki istalgan nom)
2. **Password:** Kuchli parol yarating va **SAQLANG!**
   - Masalan: `MySecurePass123!`
3. **Create Database User** tugmasini bosing

## 4. Network Access sozlash

1. Chap menuda **Network Access** ni bosing
2. **Add IP Address** tugmasini bosing
3. **Allow Access from Anywhere** ni tanlang
4. IP: `0.0.0.0/0` (avtomatik)
5. **Confirm** tugmasini bosing

## 5. Connection String olish

1. Chap menuda **Database** ga qayting
2. **Connect** tugmasini bosing
3. **Drivers** ni tanlang
4. **Driver:** Node.js, **Version:** 5.5 or later
5. Connection string ni **ko'chirib oling**:

```
mongodb+srv://telegram_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. `<password>` ni o'z parolingiz bilan almashtiring
7. Oxiriga database nomi qo'shing: `/telegram_clone`

**Tayyor string:**
```
mongodb+srv://telegram_user:MySecurePass123!@cluster0.abc123.mongodb.net/telegram_clone?retryWrites=true&w=majority
```

## 6. Render.com ga qo'shish

1. [Render.com](https://render.com) → Service → Settings
2. **Environment** bo'limiga o'ting
3. **Add Environment Variable** bosing:
   - **Key:** `MONGODB_URI`
   - **Value:** (yuqoridagi connection string)
4. **Save Changes** tugmasini bosing
5. Service avtomatik qayta deploy bo'ladi (2-3 daqiqa)

## 7. Local da test qilish (ixtiyoriy)

`backend/.env` faylida:
```env
MONGODB_URI=mongodb+srv://telegram_user:MySecurePass123!@cluster0.abc123.mongodb.net/telegram_clone?retryWrites=true&w=majority
```

Backend ni qayta ishga tushiring:
```bash
cd backend
npm start
```

Console da ko'rish kerak:
```
✅ Connected to MongoDB Atlas
💾 Data will persist across restarts
```

## Natija

✅ Ma'lumotlar doimiy saqlanadi  
✅ Server qayta ishga tushganda ma'lumotlar yo'qolmaydi  
✅ Register qilingan userlar saqlanadi  
✅ Chatlar va xabarlar saqlanadi  

## Muammolar

### "Authentication failed"
- Parol noto'g'ri kiritilgan
- Connection string da `<password>` ni almashtirish unutilgan

### "Network error"
- Network Access da 0.0.0.0/0 qo'shilmagan
- Internet ulanishi yo'q

### "Database not found"
- Connection string oxirida `/telegram_clone` yo'q
- Database nomi noto'g'ri

## Bepul limitlar

- **Storage:** 512 MB (kifoya)
- **RAM:** 512 MB shared
- **Connections:** 500 concurrent
- **Backup:** Yo'q (paid plan da)

Telegram clone uchun bu limitlar yetarli! 🚀
