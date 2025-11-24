#!/bin/bash

# VITAL Path Development Environment Setup
echo "🧩 Setting up VITAL Path Development Environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment variables
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys and database URLs"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Start development server
echo "🚀 Starting development server..."
npm run dev
