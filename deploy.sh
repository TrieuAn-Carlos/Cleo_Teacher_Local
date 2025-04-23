#!/bin/bash

# Display colored text
function echo_color() {
  local color="$1"
  local text="$2"
  echo -e "\033[${color}m${text}\033[0m"
}

# Colors
RED="31"
GREEN="32"
YELLOW="33"
BLUE="34"
MAGENTA="35"
CYAN="36"

echo_color $BLUE "🔥 Deploying to Firebase Cloud Services 🔥"
echo_color $YELLOW "Step 1: Building Next.js application..."

# Build the Next.js app
npm run build

if [ $? -ne 0 ]; then
  echo_color $RED "❌ Build failed! Fix the errors above before deploying."
  exit 1
fi

echo_color $GREEN "✅ Build completed successfully!"
echo_color $YELLOW "Step 2: Deploying to Firebase..."

# Deploy to Firebase
firebase deploy

if [ $? -ne 0 ]; then
  echo_color $RED "❌ Firebase deployment failed! Check the errors above."
  exit 1
fi

echo_color $GREEN "✅ Deployment completed successfully!"
echo_color $CYAN "🎉 Your application is now live on Firebase! 🎉" 