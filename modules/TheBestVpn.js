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
  const { launch_browser } = require("../ScrapingJob");
  const browser = await launch_browser();
  let pages = [];
  for (i = 0; i < 1; i++) pages.push(await browser.newPage());
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
      .goto(`${url}`, {
        waitUntil: "networkidle2",
        timeout: 0,
      })
      .then(async (e) => {
        let data = await page.evaluate(() => {
          b = [];
          let reviewtexts = document.querySelectorAll("div.user-review");
          let ratings = document.querySelectorAll("div.user-review");
          for (i = 0; i < reviewtexts.length; i++) {
            let reviewtext = reviewtexts[i]
              .querySelector("div.user-review-content")
              .textContent.trim();
            let rating =
              ratings[i]
                .querySelector("span.user-review-rating")
                .textContent.replaceAll("/10", "") / 2;
            let dct = { reviewtext, rating };
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
