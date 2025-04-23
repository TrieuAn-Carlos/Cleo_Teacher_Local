@echo off
echo [94m🔥 Deploying to Firebase Cloud Services 🔥[0m
echo [93mStep 1: Building Next.js application...[0m

:: Build the Next.js app
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo [91m❌ Build failed! Fix the errors above before deploying.[0m
  exit /b 1
)

echo [92m✅ Build completed successfully![0m
echo [93mStep 2: Deploying to Firebase...[0m

:: Deploy to Firebase
call firebase deploy

if %ERRORLEVEL% NEQ 0 (
  echo [91m❌ Firebase deployment failed! Check the errors above.[0m
  exit /b 1
)

echo [92m✅ Deployment completed successfully![0m
echo [96m🎉 Your application is now live on Firebase! 🎉[0m 