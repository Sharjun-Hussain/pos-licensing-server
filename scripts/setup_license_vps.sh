#!/bin/bash
# --- Inzeedo License Server: Reset & Setup Script ---
# This script resets the database, installs dependencies, and initializes the admin.

set -e

echo "----------------------------------------------------"
echo " 🚀 Resetting & Setting up License Server"
echo "----------------------------------------------------"

# Navigate to the license server directory (assuming script is in scripts/)
cd "$(dirname "$0")/.."

# 1. Stop existing process if running (using pm2)
if command -v pm2 &> /dev/null; then
    echo "🛑 Stopping existing license-server process..."
    pm2 stop license-server || true
else
    echo "ℹ️  PM2 not found. Skipping stop command."
fi

# 2. Reset Database (Delete old SQLite file)
if [ -f "database.sqlite" ]; then
    echo "🗑️  Deleting old database.sqlite to reset everything..."
    rm database.sqlite
    echo "✅ Database reset."
else
    echo "ℹ️  No database.sqlite found. Starting fresh."
fi

# 3. Install Dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Initialize Database & Admin
echo "👤 Initializing fresh Admin account..."
# This creates the tables via sequelize.sync() and adds the admin user
node reset-admin.js

# 5. Start Server with PM2
if command -v pm2 &> /dev/null; then
    echo "🚀 Starting server with PM2..."
    pm2 start server.js --name license-server
    pm2 save
    echo "✅ Server started and saved in PM2."
else
    echo "⚠️  PM2 not found. Starting with Node in background..."
    nohup npm start > logs/server.log 2>&1 &
    echo "✅ Server started with nohup. Check logs/server.log for output."
fi

echo "----------------------------------------------------"
echo " ✅ LICENSE SERVER RESET & STARTED!"
echo " PORT: 5050"
echo " Admin: admin / Sarjun@7358"
echo "----------------------------------------------------"
