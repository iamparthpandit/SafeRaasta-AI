@echo off
REM Run SafeRaasta on Android phone with correct JAVA_HOME

echo Setting JAVA_HOME...
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Checking connected devices...
adb devices
echo.

echo Starting Metro bundler in background...
start "Metro Bundler" cmd /c "npm start"

echo.
echo Waiting 5 seconds for Metro to start...
timeout /t 5 /nobreak > nul

echo.
echo Building and installing app on phone...
call npm run android

echo.
echo Done! Check your phone for the SafeRaasta app.
pause
