# Telegram Clone - Tezkor Ishga Tushirish Qo'llanmasi

## 1. PostgreSQL O'rnatish va Sozlash

### Windows
1. PostgreSQL yuklab oling: https://www.postgresql.org/download/windows/
2. O'rnatish jarayonida parol o'rnating (masalan: `postgres`)
3. pgAdmin 4 avtomatik o'rnatiladi

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. Database Yaratish

### Usul 1: psql orqali
```bash
# PostgreSQL ga kirish
psql -U postgres

# Database yaratish
CREATE DATABASE telegram_clone;

# Chiqish
\q
```

### Usul 2: pgAdmin orqali
1. pgAdmin 4 ni oching
2. Servers > PostgreSQL > Databases
3. Right-click > Create > Database
4. Database name: `telegram_clone`
5. Save

## 3. Backend Sozlash

```bash
# Backend papkasiga o'tish
cd backend

# Dependencies o'rnatish
npm install

# Environment variables sozlash
cp .env.example .env
```

### .env faylini tahrirlash
```env
PORT=5000
NODE_ENV=development

# Database sozlamalari (o'zingiznikiga moslashtiring)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telegram_clone
DB_USER=postgres
DB_PASSWORD=postgres  # O'zingizning parolingiz

# JWT secret (production da o'zgartiring!)
JWT_SECRET=my_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=900000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Migration ishga tushirish
```bash
npm run migrate
```

Muvaffaqiyatli bo'lsa:
```
🚀 Starting database migrations...
✅ Database connected successfully
✅ Migrations completed successfully
```

### Backend serverni ishga tushirish
```bash
npm run dev
```

Muvaffaqiyatli bo'lsa:
```
✅ Database connected successfully
🚀 Server running on port 5000
📝 Environment: development
```

## 4. Frontend Sozlash

Yangi terminal oching:

```bash
# Frontend papkasiga o'tish
cd frontend

# Dependencies o'rnatish
npm install

# Environment variables sozlash (ixtiyoriy)
cp .env.example .env
```

### Frontend serverni ishga tushirish
```bash
npm run dev
```

Muvaffaqiyatli bo'lsa:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 5. Loyihani Sinab Ko'rish

1. Brauzerda ochish: http://localhost:3000
2. "Ro'yxatdan o'tish" tugmasini bosing
3. Ma'lumotlarni kiriting:
   - Telefon: `+998901234567`
   - Ism: `Test`
   - Parol: `TestPass123` (kamida 8 ta belgi, katta/kichik harf, raqam)
4. "Ro'yxatdan o'tish" tugmasini bosing
5. Dashboard sahifasiga yo'naltirilasiz

## 6. Muammolarni Hal Qilish

### Database ulanish xatoligi
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Yechim:**
- PostgreSQL ishga tushganligini tekshiring:
  ```bash
  # Windows
  services.msc -> PostgreSQL ni toping

  # macOS
  brew services list

  # Linux
  sudo systemctl status postgresql
  ```

### Migration xatoligi
```
Error: relation "users" already exists
```

**Yechim:**
- Database ni tozalang va qayta yarating:
  ```sql
  DROP DATABASE telegram_clone;
  CREATE DATABASE telegram_clone;
  ```
- Migration ni qayta ishga tushiring

### Port band xatoligi
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Yechim:**
- Boshqa port ishlatish (.env da PORT ni o'zgartiring)
- Yoki portni band qilgan jarayonni to'xtatish:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### CORS xatoligi
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Yechim:**
- Backend .env da ALLOWED_ORIGINS ni tekshiring
- Frontend URL ni qo'shing (masalan: http://localhost:3000)

## 7. Test Foydalanuvchilar

Loyihani sinash uchun bir nechta test foydalanuvchilar yarating:

1. **Test User 1**
   - Phone: `+998901111111`
   - Password: `TestPass123`
   - Name: `Ali`

2. **Test User 2**
   - Phone: `+998902222222`
   - Password: `TestPass123`
   - Name: `Vali`

## 8. Keyingi Qadamlar

Loyiha muvaffaqiyatli ishga tushgandan keyin:

1. ✅ Login va Register ishlayotganini tekshiring
2. ✅ Account locking funksiyasini sinab ko'ring (5 marta noto'g'ri parol)
3. ✅ Token expiration ni tekshiring
4. ✅ Responsive design ni turli qurilmalarda sinab ko'ring

## 9. Production Deployment

Production uchun:

1. **Backend:**
   - JWT_SECRET ni kuchli qiymatga o'zgartiring
   - NODE_ENV=production
   - Database ni production serverga ko'chiring
   - HTTPS sozlang

2. **Frontend:**
   - `npm run build` ishga tushiring
   - `dist` papkasini hosting ga yuklang
   - VITE_API_URL ni production API URL ga o'zgartiring

## 📞 Yordam

Muammo yuzaga kelsa:
1. Console loglarni tekshiring
2. Network tab ni tekshiring (Browser DevTools)
3. Database connection ni tekshiring
4. Environment variables to'g'ri sozlanganligini tekshiring

Omad! 🚀
