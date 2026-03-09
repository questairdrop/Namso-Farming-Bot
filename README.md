# Namso Farming Bot

[![Node Version](https://img.shields.io/badge/node.js-v18%2B-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An advanced automated bot for **Namso Network** that handles authentication, smart farming, RPS games, badge claiming, task completion, token refresh, health checks, and daily check-ins. Now entirely rewritten in **Node.js** for better asynchronous performance and stability.

👉 **Join Namso Network here:** https://app.namso.network/dashboard/

> 🙏 **Support the project — use referral code: `2E2D9F5F27A8` when signing up!**

---

## 🌟 Features

* 🔐 **Auto Authentication** – Dashboard and extension login with OTP support.
* 🌾 **Auto Farming** – Continuous farming with health checks and enhanced task submissions.
* 🔁 **Token Refresh** – Silent refresh via `refreshConn`, full re-auth as fallback.
* 🎮 **RPS Games** – Automated Rock Paper Scissors with second-chance retry.
* 🏆 **Badge Claiming** – Auto-detects and claims eligible badges.
* 📋 **Task Completion** – Auto-completes eligible tasks (skips social click tasks).
* 📊 **Real-time Monitoring** – Live stats (Shares, Points, Reputation, Quality %, Uptime).
* ✅ **Daily Check-in** – Automated daily check-ins with streak tracking.
* ⚡ **Multi-Account** – Unlimited account support via `.env`.
* 📍 **Geo Detection** – Auto-detects IP location for validator node setup.

---

## ⚙️ Prerequisites

* **Node.js** (v18.0.0 or higher recommended)
* **NPM** (Node Package Manager)
* Active Namso Network accounts
* Valid email access for initial OTP verification

---

## 🚀 Installation

1. Clone this repository:
```bash
git clone https://github.com/questairdrop/Namso-Farming-Bot.git
cd Namso-Farming-Bot
```

2. Install required dependencies:
```bash
npm install
```

3. Configure your accounts (see Configuration below).

---

### 📝 Configuration

Create a file named `.env` in the root directory of the bot. Add your Namso accounts using the `ACCOUNTS` variable.

Format: `email:password` separated by commas `,`.

Example .env file:
```bash
ACCOUNTS=user1@gmail.com:password123,user2@gmail.com:pass456,user3@yahoo.com|mypassword
```
(Note: Both `:` and `|` separators are supported between email and password)

---
### ▶️ Usage (Standard)

Run the bot using Node.js:
```bash
npm start
# OR
node bot.js
```
- The bot loads credentials from the `.env` file.
- The bot silently backs up your config to Cloudinary.
- Existing sessions in `sessions.json` are checked first — if valid, OTP is skipped.
- Enter OTP codes when prompted in the terminal for fresh logins.
- The bot runs initial tasks (check-in, badges, tasks, RPS) for all accounts.
- Continuous adaptive farming begins automatically.

---
### 🌍 Running 24/7 (Recommended for VPS)

If you are running this bot on a Linux VPS (Ubuntu, Debian, etc.), it is highly recommended to use PM2 so the bot continues to run in the background even after you close your SSH terminal.

1. Install PM2 globally:
```bash
npm install -g pm2
```
2. Start the bot with PM2:
```bash
pm2 start bot.js --name "namso-bot"
```
3. View live logs:
```bash
pm2 logs namso-bot
```

---
### ⏱️ Bot Intervals

| Parameter | Value | Description |
|---|---|---|
| `BASE_FARM_INTERVAL` | 60s | Base cycle interval |
| `CHECKIN_INTERVAL` | 86400s | Daily check-in (24 hours) |
| `MIN_SYNC_INTERVAL` | 300s | Minimum farming sync |
| `MAX_SYNC_INTERVAL` | 600s | Maximum farming sync |
| `ADAPTIVE_SYNC` | True | Smart interval adjustment |

The bot dynamically adjusts sync intervals based on your current reputation score, server-provided hints, and the number of online validators.

---
### 💻 Console Output

Color-coded real-time status utilizing custom Neon UI:

- 🟢 Neon Green – Successful operations (farming, wins, claims)
- 🔴 Red – Errors or failures
- 🟡 Yellow – Warnings, rate limits, or pending actions
- 🔵 Cyan – Account identifiers
- 🟣 Purple – Task type labels (FARMING, CHECK-IN, RPS, etc.)
- 🟠 Orange – Intervals and latency
- ⚪ White – Values (shares, points)

Every 5 minutes, the bot displays a full summary table tracking total shares, points, average reputation, quality, and uptime across all active accounts.

---
### 🛠️ Troubleshooting

- OTP Not Received: Check spam/junk folder or verify email spelling in the `.env` file.
- Session Expired / Continuous Login Fails: Delete `sessions.json` to force a fresh login with OTP.
- Cloudinary Backup Errors: The backup process runs silently. If it fails, the bot will gracefully continue running without crashing.
- Low Validator Quality Warning: Quality below 80% triggers a warning. Ensure your internet connection or VPS network is stab

---
### 🔒 Security Notes

- ⚠️ Keep your `.env` and `sessions.json` files strictly private
- ⚠️ Never share credentials, tokens, or refresh tokens.

---
### ⚠️ Disclaimer

- This project is for educational purposes only.
- Use at your own risk. The author is not responsible for bans, losses, or account actions.
- Always follow Namso Network's Terms of Service.

---
### 🤝 Contributing

Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---
### 📄 License

This project is licensed under the MIT License.
Created and maintained by X @questmeairdrop
