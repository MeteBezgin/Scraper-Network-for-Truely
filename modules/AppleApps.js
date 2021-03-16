const puppeteer = require("puppeteer-core");
const request = require("request-promise");

const get_page_and_browser_count = async (url, browser) => {
  let page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  let id = await page.evaluate(async () => {
    let id = window.location.href
      .split("#")[0]
      .split("/")
      [window.location.href.split("#")[0].split("/").length - 1].replace(
        "id",
        ""
      );
    return id;
  });
  let page_count = await request(
    `https://itunes.apple.com/lookup?id=${id}&country=us`
  ).then((body) => {
    let a = JSON.parse(body);
    let b = a.results[0].userRatingCount;
    return b;
  });
  page_count = Math.ceil(page_count / 10);
  await browser.close();
  return page_count;
};

const initialize = async (url, browser) => {
  let page_count = await get_page_and_browser_count(url, browser);
  console.log(page_count);
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
  if (page_count * 10 >= 400) {
    counts = [40];
    console.log(counts);
  }
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
        console.log("burdayım");
        const output = await page.evaluate(
          async (idx, counts, url) => {
            console.log("buradayımm");
            let productId = window.location.href
              .split("#")[0]
              .split("/")
              [
                window.location.href.split("#")[0].split("/").length - 1
              ].replace("id", "");
            const fetch_api = async (i, url) => {
              console.log(i);
              return fetch(
                `https://amp-api.apps.apple.com/v1/catalog/us/apps/${productId}/reviews?l=en-US&offset=${
                  i * 10
                }&platform=web&additionalPlatforms=appletv%2Cipad%2Ciphone%2Cmac`,
                {
                  headers: {
                    accept: "application/json",
                    "accept-language": "tr-TR,tr;q=0.9",
                    authorization:
                      "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlU4UlRZVjVaRFMifQ.eyJpc3MiOiI3TktaMlZQNDhaIiwiaWF0IjoxNjEzMTYxNDcxLCJleHAiOjE2MTYxODU0NzF9.8aFFx1YylprytJc7XdHP5k4D3yhCHEx609oEvbHh2iH5ji81sGaOCLlwikmqXhNihCuRk0DN_wgE0peQPPw0kQ",
                    "content-type":
                      "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
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
              let reviews = response.data;
              console.log(reviews);
              try {
                for (a = 0; a < reviews.length; a++) {
                  let reviewtext = reviews[a].attributes.review;
                  let rating = reviews[a].attributes.rating;
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
