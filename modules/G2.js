const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const initialize = async (url, browser) => {
  let counts = await get_page_and_browser_count(url, browser);
  const { launch_browser } = require("../ScrapingJob");
  let data_array = counts.map(async function (val, idx) {
    return new Promise(async (res, rej) => {
      let browser = await launch_browser();
      let pages = [];
      for (i = 0; i < val; i++) pages.push(await browser.newPage());
      let promises = pages.map(function (page, index) {
        return navigate(page, val, idx, url, index);
      });
      let output = await Promise.all(promises);
      await browser.close();
      return res(output);
    });
  });
  let last_data = await Promise.all(data_array);
  return last_data;
};

const get_page_and_browser_count = async (url, browser) => {
  let page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  let page_count = await page.$eval(
    "body > div.off-canvas-wrapper > div > div > div.d-f.fd-c.full-view-min-height > div > div:nth-child(5) > div:nth-child(1) > div:nth-child(2) > div.product-head.product-head--banner > div.d-ib > div > div.star-wrapper.d-f.ai-c > div.star-wrapper__desc > ul > li:nth-child(1) > a",
    (e) => e.textContent.replace(" reviews", "")
  );
  page_count = Math.ceil(page_count / 25);
  let browser_count = Math.floor(page_count / 10);
  let counts = [];
  for (i = 0; i < browser_count; i++) {
    counts.push(10);
  }
  if (page_count % 10 !== 0) {
    counts.push(page_count % 10);
  }
  await browser.close();
  return counts;
};

const navigate = (page, val, idx, url, index) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(`${url}?page=${val * idx + index + 1}`, {
      waitUntil: "networkidle2",
      timeout: 100000,
    });
    await page.waitForSelector(
      "#topnav > div > ul > li.topnav__nav__li.px-half > a"
    );
    await page
      .waitFor(5000)
      .then(async (e) => {
        let data = await page.evaluate(() => {
          b = [];
          let authors = document.querySelectorAll("span[itemprop='author']");
          let reviewtext;
          for (i = 0; i < authors.length; i++) {
            let author = authors[i].textContent.trim();
            if (
              document
                .querySelectorAll("div[itemprop='reviewBody']")
                [i].hasAttribute("data-poison-text")
            ) {
              if (
                document
                  .querySelectorAll("div[itemprop='reviewBody']")
                  [i].querySelector("meta")
              )
                continue;
              else {
                reviewtext = document
                  .querySelectorAll("div[itemprop='reviewBody']")
                  [i].querySelector("div[itemprop='reviewBody']")
                  .textContent.replaceAll(
                    "Review collected by and hosted on G2.com.",
                    ""
                  )
                  .replaceAll("Show MoreShow Less", "")
                  .replaceAll("What do you like best?", "")
                  .replaceAll("What do you dislike?", "")
                  .replaceAll(
                    "What problems are you solving with the product?  What benefits have you realized?",
                    ""
                  )
                  .replaceAll(
                    "Recommendations to others considering the product:",
                    ""
                  )
                  .trim();
              }
            } else {
              reviewtext = document
                .querySelectorAll("div[itemprop='reviewBody']")
                [i + 1].textContent.replaceAll(
                  "Review collected by and hosted on G2.com.",
                  ""
                )
                .replaceAll("Show MoreShow Less", "")
                .replaceAll("What do you like best?", "")
                .replaceAll("What do you dislike?", "")
                .replaceAll(
                  "What problems are you solving with the product?  What benefits have you realized?",
                  ""
                )
                .replaceAll(
                  "Recommendations to others considering the product:",
                  ""
                )
                .trim();
            }
            let rating = document
              .querySelectorAll("span[itemprop='reviewRating']")
              [i].querySelector("meta[itemprop='ratingValue']")
              .getAttribute("content");
            let dct = { author, reviewtext, rating };
            b.push(dct);
          }
          return b;
        });
        return resolve(data);
      })
      .catch((err) => {
        console.log(err);
        return reject({ author: "none", reviewtext: "none", rating: "none" });
      });
  });
};

module.exports = {
  init: initialize,
};
