# 🙏 OG_Confessions - "Keep Saying it"

**OG_Confessions** is a web-based spiritual affirmation platform designed to deliver distraction-free, categorized confessions directly to users. It features smooth transitions, dynamic Telegram content integration, and a clean, responsive UI built with Next.js and V0.

🌐 **Live Website**: [https://og-confessions-nj9v.vercel.app](https://og-confessions-nj9v.vercel.app) 

---

## ✨ Features
- 📂 **Dynamic Categories**: Pulled from synced Telegram content
- 🎚️ **Playback Controls**: Adjust speed (0.5x to 2x)
- 🌐 **Clean Interface**: Minimalist and intuitive, without clutter
- 📲 **Share + Favorite**: Easy to share and bookmark affirmations
- 🧑‍💼 **Admin Dashboard**: Manage categories and content via secure backend
- 🤖 **Telegram Integration**: Pulls affirmations directly from a Telegram channel
- 🧹 **Auto-Cleanup**: Automatically removes confessions older than 2 days

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/Okwesie/OG_Confessions.git
cd OG_Confessions
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
Create a `.env.local` file with the following:

```env
# Database Configuration
SUPABASE_URL=https://rpszhmtkopabgbsrzqmx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Telegram Integration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
TELEGRAM_CHANNEL_ID=@your-channel-username

# Admin Access
ADMIN_SECRET_KEY=your-secure-password

# Environment
NODE_ENV=development
```

### 4. Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view it locally.

---

## 🧠 How It Works

### User Flow:
1. **Homepage** shows categorized confessions
2. **Click** to select a category and affirmation
3. **Experience** a short "Ready → Go" countdown
4. **Affirmation** plays automatically
5. **User** can pause, change speed, or share

### Admin Flow:
1. **Secure dashboard** for managing content
2. **Sync content** manually from Telegram
3. **Update or categorize** confessions dynamically
4. **Cleanup old confessions** automatically

### Database Logic:
- **On refresh** from admin side (via Telegram), new confessions are retrieved and stored
- **Database automatically** deletes confessions older than two days
- **Frontend reads** and displays only the current entries from the database

---

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (React), Tailwind CSS
- **Backend**: API Routes, Telegram Bot API
- **Database**: PostgreSQL via Supabase
- **State Management**: React Hooks & local state
- **Deployment**: Vercel

---

## 📊 Current Status

### ✅ Working Features
- ✅ Frontend UI and user experience
- ✅ Admin dashboard with CRUD operations
- ✅ Database integration with Supabase
- ✅ Telegram Bot API integration
- ✅ Auto-deletion of old confessions
- ✅ Environment variable configuration
- ✅ Production deployment on Vercel

### 🔧 Recent Fixes
- ✅ Fixed database connection (SUPABASE_URL format)
- ✅ Fixed Next.js 15 compatibility (async params)
- ✅ Added auto-deletion logic for old confessions
- ✅ Improved error handling and logging

---

## 🚀 Deployment

The app is currently deployed and live at:
- **Main Site**: [https://og-confessions-nj9v.vercel.app](https://og-confessions-nj9v.vercel.app)
- **Admin Panel**: [https://og-confessions-nj9v.vercel.app/admin](https://og-confessions-nj9v.vercel.app/admin)

### Environment Variables for Production
All required environment variables are configured in Vercel:
- `SUPABASE_URL`: Supabase REST API URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `TELEGRAM_CHANNEL_ID`: Telegram channel ID
- `ADMIN_SECRET_KEY`: Admin dashboard password
- `NODE_ENV`: Set to production

---

## 🧹 Auto-Deletion System

The app includes an automatic cleanup system that removes confessions older than 2 days:

### Manual Cleanup
- Access admin dashboard
- Use the cleanup endpoint: `POST /api/admin/cleanup`
- View cleanup status: `GET /api/admin/cleanup`

### Automatic Cleanup (Future)
Can be configured with Vercel Cron Functions for daily automatic cleanup.

---

## 📫 Contributing / Feedback

Pull requests and issue reports are welcome! For feature ideas or bugs, open an issue or contact via Telegram (if admin).

### Getting Help
If you encounter issues:
1. Check the browser console for errors
2. Check the server logs in your terminal
3. Verify all environment variables are set correctly
4. Make sure your Telegram bot has proper permissions
5. Test the connection: `https://og-confessions-nj9v.vercel.app/api/test/connection`

---

## 🔒 Security Notes

- **Admin Password**: Change `ADMIN_SECRET_KEY` to a strong password for production
- **Environment Variables**: Never commit `.env.local` to Git
- **API Keys**: Rotate Telegram bot token if compromised
- **Database**: Uses Supabase with proper authentication

---

## 📈 Monitoring

Monitor the app's health via:
- Database connection: `/api/test/connection`
- Admin dashboard: `/admin`
- Telegram sync: Admin panel sync function
- Auto-deletion: Cleanup endpoint logs

Your app is now live and fully functional! 🎉
