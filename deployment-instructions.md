# 🚀 OG_Confessions Deployment Instructions

## ✅ Issues Fixed
1. **Database Connection**: Fixed SUPABASE_URL format (REST API vs PostgreSQL connection string)
2. **Next.js 15 Compatibility**: Fixed async params in API routes
3. **Auto-Deletion Logic**: Added function to delete confessions older than 2 days
4. **Error Handling**: Improved error messages and logging

## 📋 Pre-Deployment Checklist

### 1. Fix Local Environment Variables
**CRITICAL STEP**: Update your `.env.local` file:

```bash
# Change this line:
SUPABASE_URL=postgresql://postgres.rpszhmtkopabgbsrzqmx:Calebkojo@12@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# To this:
SUPABASE_URL=https://rpszhmtkopabgbsrzqmx.supabase.co
```

### 2. Test Locally
```bash
# Test database connection
curl http://localhost:3003/api/test/connection

# Test cleanup function
curl http://localhost:3003/api/admin/cleanup

# Both should return success status
```

## 🚀 Vercel Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Fix database connection and add auto-deletion"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. **IMPORTANT**: Add these environment variables in Vercel dashboard:

```
SUPABASE_URL=https://rpszhmtkopabgbsrzqmx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwc3pobXRrb3BhYmdic3J6cW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NjM4MjUsImV4cCI6MjA2NDEzOTgyNX0.y8AsL4CauEvLDW8WWsRS-IL4_qabT32VBuRub4waDMA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwc3pobXRrb3BhYmdic3J6cW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU2MzgyNSwiZXhwIjoyMDY0MTM5ODI1fQ.M83UOk4GsWHT86Ve-TdpT07rmqWBb8kNIM9hnrEYMvA
TELEGRAM_BOT_TOKEN=7735233550:AAG_k6j6wrGkH5focJN5xZCwhYp-XxQG_og
TELEGRAM_CHANNEL_ID=@Daily_Confessions_Affirmations
ADMIN_SECRET_KEY=admin2411
NODE_ENV=production
```

### Step 3: Deploy and Test
1. Click "Deploy"
2. Once deployed, test these endpoints:
   - `https://your-app.vercel.app/api/test/connection`
   - `https://your-app.vercel.app/admin`

## 🧹 Auto-Deletion Setup

### Option 1: Manual Cleanup (Recommended for now)
- Go to your admin dashboard
- Call the cleanup endpoint: `POST /api/admin/cleanup`
- This deletes confessions older than 2 days

### Option 2: Automatic Cleanup (Future Enhancement)
You can set up a cron job or use Vercel Cron Functions to automatically run cleanup daily:

```javascript
// In vercel.json, add:
{
  "crons": [
    {
      "path": "/api/admin/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## ✅ Post-Deployment Verification

1. **Test Database Connection**:
   ```bash
   curl https://your-app.vercel.app/api/test/connection
   ```

2. **Test Admin Access**:
   - Visit `https://your-app.vercel.app/admin`
   - Use password: `admin2411`

3. **Test Telegram Sync**:
   - In admin dashboard, click "Sync from Telegram"
   - Should fetch new confessions

4. **Test Frontend**:
   - Visit `https://your-app.vercel.app`
   - Select a category
   - Confessions should load and display

## 🐛 Common Deployment Issues

### Database Connection Fails
- **Cause**: Wrong SUPABASE_URL format
- **Fix**: Ensure you use `https://xxx.supabase.co`, not the PostgreSQL connection string

### API Routes Return 500 Errors
- **Cause**: Missing environment variables
- **Fix**: Double-check all env vars are set in Vercel dashboard

### Telegram Sync Fails
- **Cause**: Bot not properly configured
- **Fix**: Ensure bot is admin in your Telegram channel

### Frontend Shows No Confessions
- **Cause**: No data or database connection issues
- **Fix**: Use admin panel to sync from Telegram first

## 🔒 Security Notes

1. **Change Admin Password**: Update `ADMIN_SECRET_KEY` to a strong password for production
2. **Environment Variables**: Never commit `.env.local` to Git
3. **API Keys**: Rotate Telegram bot token if compromised

## 📊 Monitoring

After deployment, monitor:
- Database connection health via `/api/test/connection`
- Telegram sync success in admin dashboard
- Frontend loading and confession display
- Auto-deletion working (check confession count over time)

Your app should now work perfectly in production! 🎉 