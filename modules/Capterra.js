const puppeteer = require("puppeteer-core");

const get_page_and_browser_count = async (url, browser) => {
  let page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.waitFor(2000);
  let page_count = await page.evaluate(async () => {
    console.log(window.SSR_BRIDGE_DATA.reviewCount);
    let page_count = SSR_BRIDGE_DATA.reviewCount;
    return page_count;
  });
  page_count = Math.ceil(page_count / 50);
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
            let productId = SSR_BRIDGE_DATA.productId;
            const fetch_api = async (i, url) => {
              return fetch(
                `https://www.capterra.com/spotlight/rest/reviews?apiVersion=2&productId=${productId}&from=${i}`,
                {
                  headers: {
                    accept: "*/*",
                    "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                  },
                  referrer: `${url}`,
                  referrerPolicy: "no-referrer-when-downgrade",
                  body: null,
                  method: "GET",
                  mode: "cors",
                  credentials: "include",
                }
              )
                .then((resp) => {
                  return resp.json();
                })
                .catch((resp) => {
                  console.log(resp);
                });
            };
            let data = [];
            console.log(counts);
            let total_so_far = 0;
            counts.slice(0, idx + 1).forEach((val, number) => {
              total_so_far += val;
            });
            console.log(total_so_far);
            console.log(counts);
            for (i = total_so_far - counts[idx]; i < total_so_far; i++) {
              console.log("atıyo aslında=?=");
              let response = await fetch_api(i + 1, url);
              let reviews = response.hits;
              try {
                for (a = 0; a < reviews.length; a++) {
                  let reviewtext =
                    reviews[a].consText.trim() +
                    reviews[a].generalComments.trim() +
                    reviews[a].prosText.trim();
                  let rating = reviews[a].overallRating;
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
        return err.errorMessage;
      });
  });
  return Promise.all(Data).finally(async () => {
    await browser.close();
  });
};

module.exports = {
  init: initialize,
};
