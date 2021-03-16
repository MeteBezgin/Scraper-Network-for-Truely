const puppeteer = require("puppeteer-core");

const get_page_and_browser_count = async (url, browser) => {
  let page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.waitForSelector(
    "body > main > div > div.company-profile-body > section > div.reviews-overview > div.card.card--related > div.reviews-overview-header > h2 > span"
  );
  await page.click(
    "body > main > div > div.company-profile-body > section > div.reviews-overview > div.card.card--related > div.reviews-overview-header > div > div.language-filter > button"
  );
  await page.waitForSelector(
    "body > div.modal-container.vue-portal-target > div > div > div.modal-dialog-body > form > div:nth-child(2) > label"
  );
  let page_count = await page.$eval(
    "body > div.modal-container.vue-portal-target > div > div > div.modal-dialog-body > form > div:nth-child(2) > label",
    (e) => e.textContent.replace("English (", "").replace(")", "")
  );
  page_count = page_count.replace(",", "");
  page_count = Math.ceil(page_count / 20);
  await browser.close();
  console.log(page_count);
  return page_count;
};

const initialize = async (url, browser) => {
  let page_count = await get_page_and_browser_count(url, browser);
  let counts = [];
  let pages = [];
  let needed_page_count = Math.floor(page_count / 30);
  for (i = 0; i < needed_page_count; i++) {
    counts.push(30);
  }
  if (page_count % 30 !== 0) {
    counts.push(page_count % 30);
  }
  console.log(counts);
  const { launch_browser } = require("../ScrapingJob");
  browser = await launch_browser();
  for (a = 0; a < counts.length; a++) {
    pages.push(await browser.newPage());
  }
  let Data = pages.map(async (page, idx) => {
    return page
      .goto(`${url}`, {
        waitUntil: "networkidle2",
        timeout: 0,
      })
      .then(async () => {
        console.log("burdayıms");
        const output = await page.evaluate(
          async (idx, counts, url) => {
            console.log("buradayımm");
            let div = document.createElement("div");
            const fetch_api = async (i, url) => {
              return fetch(`${url}?page=${i}`, {
                headers: {
                  "upgrade-insecure-requests": "1",
                },
                referrer: `${url}?page=${i}`,
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "omit",
              })
                .then((resp) => {
                  return resp.text();
                })
                .catch((resp) => {
                  console.log(resp);
                });
            };
            let data = [];
            let total_so_far = 0;
            counts.slice(0, idx + 1).forEach((val, number) => {
              total_so_far += val;
            });
            console.log(total_so_far);
            for (i = total_so_far - counts[idx]; i < total_so_far; i++) {
              console.log(i);
              console.log(idx * counts[idx]);
              console.log(total_so_far);
              console.log("atıyo aslında=?=");
              let response = await fetch_api(i + 1, url);
              div.innerHTML = response;
              let authors = div.querySelectorAll(
                "div.consumer-information__name"
              );
              let reviewtexts = div.querySelectorAll("p.review-content__text");
              let ratings = div.querySelectorAll("div.star-rating--medium");
              try {
                for (a = 0; a < authors.length; a++) {
                  let reviewtext = reviewtexts[a].textContent.trim();
                  let rating = ratings[a]
                    .querySelector("img")
                    .getAttribute("alt");
                  let dct = { rating, reviewtext };
                  data.push(dct);
                }
              } catch {
                let dct = { rating: "none", reviewtext: "none" };
                data.push(dct);
              }
            }
            return data;
          },
          idx,
          counts,
          url
        );
        console.log(output);
        return output;
      })
      .catch((err) => {
        return err;
      });
  });
  return Promise.all(Data).finally(async () => {
    await browser.close();
  });
};

module.exports = {
  init: initialize,
};
