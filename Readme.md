**Spotphish-ml training**

To start training the ML5 models testing:
1. Run "setup-dependencies.bat"             *This downloads the dependencies (puppeteer git repository)*
2. Run "download-modules.bat"               *This downloads all the node modules*
3. Run "bundle-puppeteer-browser.bat"       *This bundles puppeteer from it's git repository*
4. Run "run-server.bat" and enter desired port'     *This runs a proxy server which acts as an endpoint for Puppeteer in Node.js*
5. Run "run-test.bat" and a browser window will open.   *This serves the actual webpage that is used for testing.*
**(This has been tested only on Google Chrome so Google Chrome is preffered.)**

**Make sure to put the port number in Step 5 that is entered in Step 4.**

*The images are downloaded to Downloads automatically while headless browser is running
(Turn on the "allow multiple downloads" option if prompted in Chrome)*

**WARNING : DO NOT close server.bat and run-test.bat while you are running tests**