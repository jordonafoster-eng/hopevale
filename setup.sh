#!/bin/bash

echo "🎉 HopeVale Community Hub - Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if DATABASE_URL is set
if grep -q "postgresql://postgres:\[password\]" .env; then
    echo "⚠️  Please update your DATABASE_URL in .env first!"
    echo ""
    echo "Quick steps:"
    echo "1. Go to https://supabase.com (opening now...)"
    echo "2. Sign up (free, no credit card)"
    echo "3. Create a new project"
    echo "4. Copy the connection string"
    echo "5. Paste it in .env as DATABASE_URL"
    echo ""
    open https://supabase.com 2>/dev/null || echo "Visit: https://supabase.com"
    exit 1
fi

echo "✅ Found .env file"
echo ""

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npm run db:push

echo ""
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Starting development server..."
echo "   Visit: http://localhost:3000"
echo ""
echo "🔑 Default login:"
echo "   Admin: admin@example.com / admin123"
echo "   Member: john@example.com / member123"
echo ""

npm run dev
