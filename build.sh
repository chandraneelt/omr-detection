#!/bin/bash

echo "Building OMR Scanner for Vercel..."

# Build frontend
cd frontend
echo "Installing frontend dependencies..."
npm install

echo "Building React app..."
npm run build

echo "Copying build files to root..."
cd ..
cp -r frontend/build/* .

echo "Build complete! Ready for Vercel deployment."