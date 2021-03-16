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
      console.log(pages.length);
      let promises = pages.map(function (page, index) {
        return navigate(page, val, idx, url, index, counts);
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
  let page_count = await page.evaluate(async () => {
    let page_count =
      window.__NEXT_DATA__.props.pageProps.reviewsData.pagination
        .num_filtered_reviews;
    return page_count;
  });
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
  console.log(counts);
  return counts;
};

const navigate = (page, val, idx, url, index, counts) => {
  return new Promise(async (resolve, reject) => {
    if (idx == counts.length - 1 && idx !== 0) {
      await page.goto(`${url}page-${counts[idx - 1] * idx + index + 1}`, {
        waitUntil: "networkidle2",
        timeout: 100000,
      });
    } else if (counts.length == 1) {
      await page.goto(`${url}page-${index + 1}`, {
        waitUntil: "networkidle2",
        timeout: 100000,
      });
    } else {
      await page.goto(`${url}page-${val * idx + index + 1}`, {
        waitUntil: "networkidle2",
        timeout: 100000,
      });
    }
    await page
      .waitFor(100)
      .then(async (e) => {
        let data = await page.evaluate(() => {
          b = [];
          let reviews =
            window.__NEXT_DATA__.props.pageProps.reviewsData.reviews;
          try {
            for (a = 0; a < reviews.length; a++) {
              let reviewtext =
                reviews[a].cons.trim() +
                reviews[a].content.trim() +
                reviews[a].pros.trim();
              reviewtext = reviewtext.replaceAll("null", "");
              let rating = reviews[a].rating.total_rounded;
              let dct = { rating, reviewtext };
              b.push(dct);
            }
          } catch {
            let dct = { rating: "none", reviewtext: "none" };
            b.push(dct);
          }
          return b;
        });
        await page.close();
        console.log(data);
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
