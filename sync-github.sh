#!/bin/bash

# VITAL Path GitHub Sync Script
# This script helps you sync your local repository with GitHub

echo "🧩 VITAL Path GitHub Sync Helper"
echo "================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    git status --short
    exit 1
fi

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' already exists"
    git remote -v
    echo ""
    echo "🚀 Pushing to existing remote..."
    git push origin $CURRENT_BRANCH
else
    echo "❓ No remote 'origin' found. Please follow these steps:"
    echo ""
    echo "1. Create a new repository on GitHub.com"
    echo "2. Copy the repository URL"
    echo "3. Run one of these commands:"
    echo ""
    echo "   For HTTPS:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    echo "   For SSH:"
    echo "   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    echo "4. Then run this script again or push manually:"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "📖 Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual details"
fi

echo ""
echo "✨ VITAL Path Platform Ready for GitHub!"
echo "🌐 Your platform includes:"
echo "   • 50+ Healthcare AI Agents"
echo "   • User Agent Management System"
echo "   • Real-time Chat Interface"
echo "   • Knowledge Management"
echo "   • Admin Tools & Analytics"
echo "   • HIPAA Compliance Features"