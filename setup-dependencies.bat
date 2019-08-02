@echo off
cd public
git clone https://github.com/GoogleChrome/puppeteer && cd puppeteer
npm install
ping -n 1 127.0.0.1 > nul
npm run bundle