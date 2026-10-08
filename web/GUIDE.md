# Kaamnama Web: VS Code me run aur check karne ka guide

## 1. Pehle ye install karein (ek baar)
| Cheez | Version | Link |
|---|---|---|
| Node.js | 20 LTS ya usse naya | https://nodejs.org |
| VS Code | latest | https://code.visualstudio.com |

Check karne ke liye VS Code terminal me `node -v` chalayein. `v20` ya usse upar aana chahiye.

## 2. Project kholein
1. Zip ko extract karein. Andar `apps/web` folder milega.
2. VS Code: **File > Open Folder** aur `apps/web` chunein. Isi folder ko kholna hai, upar wale folder ko nahi.
3. Neeche popup aaye "Install recommended extensions" to **Install** dabayein. Ye ESLint, Prettier aur Tailwind IntelliSense lagata hai.

## 3. Frontend chalayein
VS Code me terminal kholein (**Ctrl + `**) aur ye chalayein:
```bash
npm install
npm run dev
```
Browser me kholein: **http://localhost:5173**

Bina backend ke bhi ye pages dikhenge: Home, About, How It Works, Login, Register. Baaki pages "Unable to load" ke saath **Try again** button dikhayenge. Ye normal hai.

## 4. Apne backend se jodein
1. Apna backend (`apps/api`) alag terminal me chalayein (jaise `npm run dev`). Maana gaya port **5000** hai.
2. `.env` file me ye do lines dekhein:
   ```
   VITE_API_URL=/api
   VITE_PROXY_TARGET=http://localhost:5000
   ```
   Frontend `/api/...` par call karta hai aur Vite use aapke backend tak bhej deta hai, isliye **CORS ki tension nahi**.
3. `.env` badalne ke baad `Ctrl + C` se rokar `npm run dev` dobara chalayein.
4. Agar aapka backend port alag hai to `VITE_PROXY_TARGET` badlein. Agar backend ke routes `/api` se shuru nahi hote to `src/services/*.js` me paths dekhein ya `VITE_API_URL` me poora URL likhein aur backend me CORS on karein.

### API paths kahan badalne hain
Sab API calls `src/services/` me hain, ek endpoint ek line me. Apni `*.routes.js` se milakar paths sahi karein:

| File | Kaam |
|---|---|
| `authApi.js` | OTP, register, login, category select |
| `workerApi.js` | dashboard, profile, trust score, memberships, data deletion |
| `receiptApi.js` | receipts banana, list, detail, resend |
| `customerApi.js` | customer ka confirm, OTP aur rating (bina login) |
| `profileApi.js` | public profile `/w/:slug` |
| `directoryApi.js` | search aur categories |
| `organizationApi.js` / `adminApi.js` / `notificationApi.js` | baaki modules |

Response ka shape `README.md` me likha hai. Agar aapke field ke naam alag hon to us page ki file me badal dein.

## 5. Kya check karein (is order me)
1. **Home** (`/`): hero, sample profile, tier cards. Upar "हिंदी" button dabakar language badalein.
2. **Register** (`/register`): naam aur phone daalein, phir OTP screen.
3. **OTP verify**: OTP daalein. Naya worker hai to **"What do you do?"** page aayega (Skilled work ya Teaching), phir skills.
4. **Worker Dashboard**: stats, activity chart, verification mix.
5. **Create receipt**: form bharein. Payment reference dalne par "Expected tier" **T2** ho jata hai.
6. Receipt banne ke baad **"Send to customer"** window khulegi. **Copy link** dabayein.
7. Us link ko **Incognito window** me kholein. Ye customer ka view hai. Flow: details, **Send OTP**, OTP daalein, rating aur tags.
8. Worker ke receipt page par refresh karein. Status **verified** aur tier badge dikhna chahiye.
9. **QR Code** page: QR download aur link copy.
10. **Public profile** (`/w/<slug>`): verified jobs, repeat customers, tier mix. Isme login nahi lagta.
11. **Directory** (`/directory`): search, pincode, "Use my location".
12. **Settings**: language, "Request data deletion" (DELETE type karna padta hai).
13. Organization aur Admin account se login karke unke pages dekhein.

### Mobile view check
Browser me **F12**, phir **Ctrl + Shift + M**. Phone ka size chunein (jaise iPhone SE, 375px). Yahan bottom navigation, floating "+" button aur drawer menu dikhne chahiye.

## 6. Kaam ke commands
```bash
npm run dev       # development server
npm run build     # production build (dist/ folder)
npm run preview   # production build local par dekhna
npm test          # unit tests (tiers, validators, formatters)
npm run lint      # code check
npm run format    # code format
```
Production ke liye Docker: `docker build -t kaamnama-web .` (nginx ke saath, `nginx.conf` me `/api` ka backend address badlein).

## 7. Aksar aane wali dikkatein
| Dikkat | Kya karein |
|---|---|
| `npm install` fail | Node version dekhein (`node -v` >= 20). `node_modules` folder hata kar dobara chalayein. |
| Page blank hai | **F12 > Console** me error dekhein. Zyada tar import ya API field ka naam hota hai. |
| "Cannot reach the server" | Backend chal raha hai? `VITE_PROXY_TARGET` ka port sahi hai? `.env` badalne ke baad restart kiya? |
| API 404 | **F12 > Network** me request ka URL dekhein aur `src/services/*.js` me path apne backend se milayein. |
| Login ke baad wapas login par | Token ka response shape alag hoga. `VerifyOTP.jsx` me `data.token` aur `data.user` dekhein. |
| Port 5173 busy | `npm run dev -- --port 3000` |
| Tailwind style nahi lag rahi | Dev server restart karein. |
| Features chhupane hain | `.env` me `VITE_FEATURE_ORGANIZATIONS`, `VITE_FEATURE_DIRECTORY` ya `VITE_FEATURE_EDUCATION` ko `false` karein. |
