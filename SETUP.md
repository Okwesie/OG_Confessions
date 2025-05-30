# OG_Confessions Setup Guide

## Quick Start

1. **Copy Environment Variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Fill in Required Variables**
   Edit `.env.local` and add your values:
   \`\`\`env
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
   TELEGRAM_CHANNEL_ID=@your-channel-username
   ADMIN_SECRET_KEY=your-secure-password
   \`\`\`

3. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access Admin Dashboard**
   - Go to `http://localhost:3000/admin`
   - Use the password from your `ADMIN_SECRET_KEY`

## Environment Variables Guide

### Required Variables

#### Telegram Integration
- `TELEGRAM_BOT_TOKEN`: Get from @BotFather on Telegram
- `TELEGRAM_CHANNEL_ID`: Your channel username (e.g., @your_channel)

#### Admin Access
- `ADMIN_SECRET_KEY`: Password for admin dashboard

### Optional Variables

#### Database (Choose One)
- **Supabase** (Recommended):
  \`\`\`env
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  \`\`\`
- **PostgreSQL**:
  \`\`\`env
  DATABASE_URL=postgresql://username:password@localhost:5432/og_confessions
  \`\`\`

#### AI Features
- `OPENAI_API_KEY`: For auto-categorization of affirmations

#### Authentication
- `NEXTAUTH_SECRET`: For user authentication (future feature)
- `NEXTAUTH_URL`: Your app URL

## Getting Telegram Credentials

### 1. Create a Telegram Bot
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the bot token to `TELEGRAM_BOT_TOKEN`

### 2. Add Bot to Channel
1. Add your bot to the CEYC channel as an admin
2. Get the channel username (e.g., @ceyc_daily)
3. Set `TELEGRAM_CHANNEL_ID=@ceyc_daily`

## Database Setup

### Option 1: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the URL and keys to your `.env.local`
4. The app will create tables automatically

### Option 2: PostgreSQL
1. Install PostgreSQL locally or use a cloud provider
2. Create a database named `og_confessions`
3. Add the connection string to `DATABASE_URL`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
Make sure to set these in your deployment platform:
- All the variables from your `.env.local`
- Set `NODE_ENV=production`
- Set `NEXTAUTH_URL` to your production domain

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Check that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL_ID` are set

2. **"Database configuration missing"**
   - Set either Supabase variables OR `DATABASE_URL`

3. **"Telegram sync failed"**
   - Verify bot token is correct
   - Ensure bot is added to the channel as admin
   - Check channel ID format (@channel_name)

4. **"Invalid admin password"**
   - Check `ADMIN_SECRET_KEY` in your `.env.local`
   - Default is `admin123` if not set

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs in your terminal
3. Verify all environment variables are set correctly
4. Make sure your Telegram bot has proper permissions

## Features Status

- ✅ Frontend UI and user experience
- ✅ Admin dashboard with CRUD operations
- ✅ Environment variable configuration
- ⏳ Database integration (ready for your setup)
- ⏳ Telegram Bot API integration (ready for your credentials)
- ⏳ AI-powered categorization (optional)
- ⏳ User authentication (future feature)

## Next Steps

1. Set up your environment variables
2. Configure your database
3. Set up Telegram bot integration
4. Deploy to production
5. Start syncing affirmations!
