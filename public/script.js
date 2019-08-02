//Importing puppeteer
const puppeteer = require('puppeteer');

var mobilenet;
var regressor;
var param = 90;
let img;
let data;
let url;
var csvContent = "data:text/csv;charset=utf-8,";
let urlCount = 0;
let browser;
let autoDownloadAnchor;
let fileList;
let port;
let proxyURL;


// Change the status when the model loads.
function modelReady() {
    console.log('Model loaded');
}

function customregressor() {
    console.log("custom regressor is loaded");
}

function regressorReady() {
    console.log("regressor is loaded");
    //If you want to load a pre-trained model at the start
}

function setup() {

    (async() => {
        await setDependencies();
        document.getElementById("startByUrl").addEventListener("click", function() {
            setPort();
            setProxy();
            startUrls();
        });
        document.getElementById('input').addEventListener("change", function() {
            fileList = this.files;
        })
        document.getElementById("startByFile").addEventListener("click", function() {
            startFiles();
        });
    })();

}

function setPort() {
    if (document.getElementById("portNo").value) {
        port = document.getElementById("portNo").value;
    } else {
        console.log("Enter port number first");
    }
}

function setProxy() {
    if (document.getElementById("proxyUrl").value) {
        proxyURL = document.getElementById("proxyUrl").value;
    } else {
        console.log("Enter proxy url first");
    }
}

function startFiles() {
    //get file from the input
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        fileList = Array.from(fileList);

        fileList.forEach((element) => {
            //read each file to get b64
            var reader = new FileReader();
            reader.onload = function(e) {
                url = element.name;
                data = e.target.result;
                img = document.createElement("img")
                img.src = data;
                img.onload = testModel(img, url);
            };
            reader.readAsDataURL(element);
        });
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

async function startUrls() {
    const browserWSEndpointUrl = "ws://" + proxyURL + ":" + port;
    browser = await puppeteer.connect({
        browserWSEndpoint: browserWSEndpointUrl
    });
    for (i in urlArr) {
        url = urlArr[i];
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        })
        await wait(Math.random() * 5000);
        try {
            await page.goto(url);
            var imgB64 = await page.screenshot({ type: "jpeg", encoding: "base64", quality: 100 });

            var img = document.createElement('img');

            // When the event "onload" is triggered we can resize the image.
            img.onload = async() => {
                // We create a canvas and get its context.
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');

                // We set the dimensions at the wanted size.
                canvas.width = 244;
                canvas.height = 244;

                // We resize the image with the canvas method drawImage();
                ctx.drawImage(img, 0, 0, 244, 244);

                var dataURI = canvas.toDataURL();

                /////////////////////////////////////////
                await gotFile(imgB64, url);
                /////////////////////////////////////////
            };

            // We put the Data URI in the image's src attribute
            img.src = "data:image/jpeg;base64," + imgB64;

            // console.log("imgb64" + imgB64);

        } catch (error) {
            console.log(error);
        }
        await page.close();
    }
}

function wait(time) {
    setTimeout(() => {
        console.log("waited for " + time / 1000)
    }, time);
}

async function setDependencies() {

    //regressor initialization
    const options = { version: 1, epochs: 20, numLabels: 5, batchSize: 0.5 };
    mobilenet = ml5.featureExtractor('MobileNet', options, modelReady);
    regressor = mobilenet.regression(regressorReady);
    regressor.load('model.json', customregressor);

    //Anchor tag for automatoic download
    autoDownloadAnchor = document.createElement("a");
    var fileName = "spotphish_results-" + ((new Date()).toString()).substr(0, 21).replace(":", "").replace(/ /g, "-") + ".csv";
    console.log(fileName);

    autoDownloadAnchor.setAttribute("download", fileName);



    //Event Listeners on Buttons
    document.getElementById("downloadCSV").addEventListener("click", function() {
        csvArray.forEach(function(infoArray, index) {
            dataString = infoArray.join(",");
            csvContent += dataString + "\n";
        });
        var encodedUri = encodeURI(csvContent);

        window.open(encodedUri);
    });

    document.getElementById("close").addEventListener("click", async function() {

        await browser.close();
    });
}


function testModel(img, url) {
    // Get a prediction for that image ans save results
    document.body.appendChild(img)
    regressor.predict(img, function(err, result) {
        //accepts P-5 Image element or HTML image element as "img"
        var temp = [];
        var temp1 = [];
        console.log(result);
        result.forEach(line => {
            temp1.push(line.label);
            temp1.push((Math.round(line.confidence * 10000) / 100))
        });
        //Verify and then push results to array (for later encoding to csv)
        var status = check(url, temp1[0], temp1[1])
        temp1.push(status)
        temp = [
            url,
            temp1
        ]
        csvArray.push(temp)
        urlCount += 1;
        // console.log(url + results);

        console.log("Batch completed " + Math.round((urlCount / urlArr.length) * 10000) / 100 + "%");
    });
}

function gotFile(imgB64, url) {
    //Convert B64 => DataURL => HTML Image element to be passed in testModel

    data = "data:image/jpeg;base64," + imgB64;
    img = document.createElement("img")
    img.src = data;
    console.log(img);

    if (document.getElementById('downloadImages').checked) {
        autoDownload(data, url);
    }
    testModel(img, url)
}

function check(url, result, confidence) {
    //Verify if the results are ok and mark them as false-positive, false-negative, positive and negative
    result = result.toLowerCase();
    console.log(url + "---" + result + "---" + confidence)
    if (isRightMatch(url, result)) {
        if (confidence > param) {
            return "CORRECT PREDICTION";
        } else {
            return "false-negative";
        }
    } else {
        if (confidence > param) {
            return "false-positive";
        } else {
            return "CORRECT PREDICTION";
        }
    }
}

function strip(url) {
    // Strip the url for checking if testurl which is parameter url, is from the same domain.
    let strippedURL = url;
    domains.forEach(domainName => {
        strippedURL = strippedURL.replace(domainName, "")
    });
    protocols.forEach(protocol => {
        strippedURL = strippedURL.replace(protocol, "")
    });
    strippedURL = strippedURL.replace(www, "")
    return strippedURL
}

function autoDownload(data, url) {
    //Auto download screenshots of the visited webpages
    var saveName = strip(url)
    saveName = saveName.replace(/\./gi, "").trim()
    autoDownloadAnchor.setAttribute('href', data);
    autoDownloadAnchor.setAttribute('download', saveName)
    document.querySelector("body").appendChild(autoDownloadAnchor)
    autoDownloadAnchor.click();
}

function isRightMatch(url, result) {
    //Actual checking of url and the result. i.e. if they are from the same domain.
    result = result.toLowerCase();
    result = "." + result + ".";
    var urlStripped = strip(url)

    if (urlStripped.includes(result)) {
        return true
    } else {
        return false
    }
}