# GitHub ga to'g'ri push qilish

## 1. Git holatini tekshirish

```bash
git status
```

Agar `backend/` va `frontend/` qizil rangda ko'rinmasa, qo'shish kerak.

## 2. Hamma fayllarni qo'shish

```bash
git add .
git add backend/
git add frontend/
git add -f backend/src/
git add -f frontend/src/
```

## 3. Commit qilish

```bash
git commit -m "Add backend and frontend for deployment"
```

## 4. Push qilish

```bash
git push origin main
```

## 5. GitHub da tekshirish

1. GitHub repository ga kiring: https://github.com/Davlatbek1717/telegram-clone
2. `backend/` va `frontend/` papkalar ko'rinishini tekshiring
3. Agar ko'rinmasa, quyidagi buyruqni bajaring:

```bash
git rm -r --cached .
git add .
git commit -m "Fix gitignore and add all files"
git push origin main
```

## 6. Render.com da qayta deploy

1. Render.com → Service → Manual Deploy → "Clear build cache & deploy"
2. Yoki Settings → "Redeploy"

## Render.com sozlamalari (to'g'ri):

**Root Directory:** `backend`

**Build Command:**
```
npm install && cd ../frontend && npm install && npm run build && cd ../backend
```

**Start Command:**
```
npm start
```

**Environment Variables:**
- NODE_ENV = production
- PORT = 10000
- MONGODB_URI = (MongoDB Atlas dan)
- JWT_SECRET = (32+ belgili string)
- JWT_EXPIRES_IN = 30d
- BCRYPT_ROUNDS = 10
