# 🙏 OG_Confessions - "Keep Saying it"

**OG_Confessions** is a web-based spiritual affirmation platform designed to deliver distraction-free, categorized confessions directly to users. It features smooth transitions, dynamic Telegram content integration, and a clean, responsive UI built with Next.js and V0.

---

## ✨ Features
- 📂 **Dynamic Categories**: Pulled from synced Telegram content
- 🎚️ **Playback Controls**: Adjust speed (0.5x to 2x)
- 🌐 **Clean Interface**: Minimalist and intuitive, without clutter
- 📲 **Share + Favorite**: Easy to share and bookmark affirmations
- 🧑‍💼 **Admin Dashboard**: Manage categories and content via secure backend
- 🤖 **Telegram Integration**: Pulls affirmations directly from a Telegram channel

---

## 🚀 Getting Started

### 1. Clone the Repo
\`\`\`bash
git clone https://github.com/Okwesie/OG_Confessions.git
cd OG_Confessions

2. Install Dependencies

npm install

3. Set Environment Variables

Create a .env.local file with the following:

TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Other optional vars can be left commented

4. Run the App

npm run dev

Visit http://localhost:3000 to view it locally.

⸻

🧠 How It Works
	1.	User Flow:
	•	Homepage shows categorized confessions
	•	Click to select a category and affirmation
	•	Experience a short “Ready → Go” countdown
	•	Affirmation plays automatically
	•	User can pause, change speed, or share
	2.	Admin Flow:
	•	Secure dashboard for managing content
	•	Sync content manually from Telegram
	•	Update or categorize confessions dynamically

⸻

🛠 Tech Stack
	•	Frontend: Next.js (React), Tailwind CSS
	•	Backend: API Routes, Telegram Bot API
	•	State Management: React Hooks & local state
	•	Deployment: Vercel

⸻

📫 Contributing / Feedback

Pull requests and issue reports are welcome! For feature ideas or bugs, open an issue or contact via Telegram (if admin).

⸻

🧘🏾‍♂️ Mission

OG_Confessions is designed to uplift spirits and create a peaceful space for spiritual growth — one affirmation at a time.

⸻
