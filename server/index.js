const puppeteer = require("puppeteer");
const http = require("http");
const httpProxy = require("http-proxy");
const proxy = new httpProxy.createProxyServer();
var port;

if (!(isNaN(process.argv[2])) && 65535 >= process.argv[2] >= 0) {
    port = process.argv[2];
    setup();
} else {
    console.log("Invalid Port entered : " + process.argv[2]);
}

function setup() {
    http
        .createServer()
        .on("upgrade", async(req, socket, head) => {
            const browser = await puppeteer.launch({ headless: false });
            const target = browser.wsEndpoint();
            proxy.ws(req, socket, head, { target });
        })
        .on("error", function(err, req, res) {
            console.log(err);
        })
        .listen(port, function() {
            console.log(`proxy server running at ${port}`);
        });
}