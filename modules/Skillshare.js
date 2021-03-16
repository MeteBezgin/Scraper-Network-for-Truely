const puppeteer = require("puppeteer-extra");
const proxyChain = require("proxy-chain");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const initialize = async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "wss://chrome.browserless.io?token=38528c19-0af1-44c7-906c-937db5721251",
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      //`--proxy-server=${newProxyUrl}`,
      "--no-sandbox",
      "--headless",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();
  return new Promise(async (resolve, reject) => {
    await page
      .goto(
        "https://www.skillshare.com/classes/Sketchbook-Magic-I-Start-and-Feed-a-Daily-Art-Practice/1314048759/reviews",
        {
          waitUntil: "networkidle2",
          timeout: 0,
        }
      )
      .then(async () => {
        const data = await page.evaluate(async () => {
          b = [];
          for (i = 0; i < 20; i++) {
            let response = await fetch(
              `https://www.skillshare.com/reviews/reviewsLoadMore?sku=1314048759&offset=${
                i * 5
              }&collectionType=1`,
              {
                headers: {
                  accept: "application/json, text/javascript, */*; q=0.01",
                  "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "no-cors",
                  "sec-fetch-site": "same-origin",
                  "x-csrftoken":
                    "U3ZXTkRIZWE4NXdSQk43WnVHbWNva0MwOVdnZDBnRVpsydI2_A7v4hnSdJPejnzo6hNEjKZ2UTcymY_g1tFxyQ==",
                  "x-newrelic-id": "VgUPU1RRGwEAXVZVBgkO",
                  "x-requested-with": "XMLHttpRequest",
                },
                referrer:
                  "https://www.skillshare.com/classes/Sketchbook-Magic-I-Start-and-Feed-a-Daily-Art-Practice/1314048759/reviews",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "no-cors",
                credentials: "include",
              }
            );

            let resp = await response.json();
            console.log("runs");

            for (a = 0; a < 5; a++) {
              let reviewtext = resp["reviews"][a]["testimonial"];
              if (reviewtext.length < 1) {
                continue;
              }
              let rating = resp["reviews"][a]["overallRating"];
              let dct = { reviewtext, rating };
              b.push(dct);
            }

            console.log(b);
          }
          console.log(b);
          return b;
        });
        console.log(data);
        return resolve(data);
      })
      .catch((err) => {
        return resolve(err);
      });
  });
};

module.exports = {
  init: initialize,
};
