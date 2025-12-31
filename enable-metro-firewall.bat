@echo off
echo Adding Windows Firewall rule for React Native Metro...
netsh advfirewall firewall delete rule name="React Native Metro Bundler" >nul 2>&1
netsh advfirewall firewall add rule name="React Native Metro Bundler" dir=in action=allow protocol=TCP localport=8081
echo.
echo Done! Metro port 8081 is now accessible on your network.
echo Press any key to close...
pause >nul
