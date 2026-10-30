# Putting ClearDocs online (free)

The job application asks for a website link and an app link. This gets you both.

## 1. Backend → Render

1. Push the repo to GitHub.
2. On render.com: **New → Web Service**, pick the repo.
3. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CLIENT_ORIGINS` (add your Vercel URL after step 2).
5. Deploy. Your API is at `https://cleardocs-api.onrender.com` (or similar). Check `/api/health`.
6. Seed the database once from your laptop: put the same `MONGO_URI` in `backend/.env` and run `npm run seed`.

Free Render services sleep after 15 minutes of no traffic, so the first request after a while takes about 30 seconds. Uploaded files are lost when the free service restarts; for a demo that's fine. For real use, store files in Cloudinary or S3.

## 2. Website → Vercel

1. On vercel.com: **Add New → Project**, pick the repo.
2. **Root directory:** `website`
3. Environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render URL
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (you can add it after the first deploy)
   - `WORDPRESS_API_URL` = your WordPress REST API (optional)
4. Deploy. Then add the Vercel URL to `CLIENT_ORIGINS` on Render, so the contact form is allowed.

## 3. App → APK

1. In `mobile/.env`: `EXPO_PUBLIC_API_URL=https://your-render-url`
2. ```bash
   npm install -g eas-cli
   eas login
   cd mobile
   eas build -p android --profile preview
   ```
   The first time, `eas build` asks a few questions and creates `eas.json`. If it doesn't offer a `preview` profile, add this to `eas.json`:
   ```json
   { "build": { "preview": { "android": { "buildType": "apk" }, "distribution": "internal" } } }
   ```
3. EAS gives you a link to download the APK. That link is what you send.

Also record a 1–2 minute screen recording of the app: sign up, submit a request with files, then log in as admin and move it to Completed. Reviewers often watch the video before installing anything.
