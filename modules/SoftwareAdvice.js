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
    "#review-list-widget > div:nth-child(1) > div > div > p > span > span > strong:nth-child(3)",
    (e) => e.textContent
  );
  page_count = Math.ceil(page_count / 50);
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
    if (idx == counts.length - 1 && idx !== 0) {
      await page.goto(
        `${url}/reviews/?review.page=${counts[idx - 1] * idx + index + 1}`,
        {
          waitUntil: "networkidle2",
          timeout: 100000,
        }
      );
    } else if (counts.length == 1) {
      await page.goto(`${url}/reviews/?review.page=${index + 1}`, {
        waitUntil: "networkidle2",
        timeout: 100000,
      });
    } else {
      await page.goto(`${url}/reviews/?review.page=${val * idx + index + 1}`, {
        waitUntil: "networkidle2",
        timeout: 100000,
      });
    }
    await page
      .waitFor(100)
      .then(async (e) => {
        let data = await page.evaluate(() => {
          b = [];
          let authors = document.querySelectorAll("strong.review-profile-name");
          let reviewtexts = document.querySelectorAll(
            "div.review-copy-container"
          );
          let ratings = document.querySelectorAll("app-review-item");
          for (i = 0; i < authors.length; i++) {
            let author = authors[i].textContent.trim();
            let reviewtext = reviewtexts[i].textContent
              .replaceAll("Pros", "")
              .replaceAll("Cons", "")
              .replaceAll(
                document.querySelector("p.review-copy-header.strong")
                  .textContent,
                ""
              );
            let rating =
              ratings[i]
                .querySelector("div.new-stars")
                .className.replace(
                  "new-stars new-stars-x2 new-stars-rank new-stars-rank__",
                  ""
                ) / 20;
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
