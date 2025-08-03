@echo off
echo ==========================================
echo     Ban-Pick App Setup Script
echo ==========================================
echo.

echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Installing server dependencies...
cd ban-pick-server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo ⚛️ Installing client dependencies...
cd ..\ban-pick-webapp
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo 📋 Setting up environment files...
cd ..\ban-pick-server
if not exist .env (
    copy .env.example .env
    echo ✅ Created server .env file
) else (
    echo ⚠️ Server .env already exists
)

cd ..\ban-pick-webapp
if not exist .env (
    copy .env.example .env
    echo ✅ Created client .env file
) else (
    echo ⚠️ Client .env already exists
)

cd ..
echo.
echo ==========================================
echo     🎉 Setup completed successfully!
echo ==========================================
echo.
echo Next steps:
echo 1. Edit .env files if needed:
echo    - ban-pick-server\.env
echo    - ban-pick-webapp\.env
echo.
echo 2. Start development:
echo    npm run dev
echo.
echo 3. Or start individually:
echo    npm run server:dev  (for server only)
echo    npm run client:dev  (for client only)
echo.
pause
