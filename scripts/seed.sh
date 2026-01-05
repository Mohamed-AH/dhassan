#!/bin/bash

# Seed the MongoDB database with sample data
echo "🌱 Seeding database..."
echo ""

docker exec -i dhassan-mongodb mongosh -u admin -p password123 --authenticationDatabase admin lecture_notes < scripts/seed-mongo.js

echo ""
echo "✅ Done! Visit http://localhost:3000 to see the lectures"
echo "📚 Visit http://localhost:3000/archive to see the archive"
echo "🔐 Visit http://localhost:3000/admin/login to access admin panel"
