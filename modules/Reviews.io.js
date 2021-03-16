const puppeteer = require("puppeteer-core");
const proxyChain = require("proxy-chain");

const initialize = async (url) => {
  console.log("abi buraya da girdim");
  let username = "growthgrind";
  let password = "560a70-9a29bc-41330b-f12df2-50c9fe";
  let PROXY_RACK_DNS = "mixed.rotating.proxyrack.net";
  let PROXYRACK_PORT = 444;
  let proxyUrl =
    "http://" +
    username +
    ":" +
    password +
    "@" +
    PROXY_RACK_DNS +
    ":" +
    PROXYRACK_PORT;
  let newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
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
  let pages = [];
  for (i = 0; i < 10; i++) pages.push(await browser.newPage());
  let promises = pages.map(function (page, index) {
    return navigate(page, index, url);
  });
  let output = await Promise.all(promises);
  console.log(output);
  return output;
};

const navigate = (page, index, url) => {
  return new Promise(async (resolve, reject) => {
    return page
      .goto(`${url}${index + 1}`, {
        waitUntil: "networkidle2",
        timeout: 0,
      })
      .then(async (e) => {
        let data = await page.evaluate(() => {
          b = [];
          let authors = document.querySelectorAll("a.Review__author");
          let reviewtexts = document.querySelectorAll("span.Review__body");
          let ratings = document.querySelectorAll(
            "div.Review__overallStars__stars"
          );
          for (i = 0; i < authors.length; i++) {
            let author = authors[i].textContent.trim();
            let reviewtext = reviewtexts[i].textContent.trim();
            let rating = ratings[i]
              .querySelectorAll("i.icon-full-star-01")
              .length.toString();
            let dct = { author, reviewtext, rating };
            b.push(dct);
          }
          return b;
        });
        return resolve(data);
      })
      .catch((err) => {
        console.log(err);
        return resolve({ author: "none", reviewtext: "none", rating: "none" });
      });
  });
};

module.exports = {
  init: initialize,
};
