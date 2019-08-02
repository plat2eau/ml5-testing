@echo off
echo "Please keep this terminal running..."
echo "Initialising proxy server now..."
cd server
SET /P variable="Enter port number - "
node index.js %variable%