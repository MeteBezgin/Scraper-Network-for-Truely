const puppeteer = require("puppeteer-core");

const get_page_and_browser_count = async (url, browser) => {
  let page = await browser.newPage();
  await page.goto(url);
  await page.evaluate(async () => {
    document.querySelector(
      "#user-review > div > div.block-foot > div > ul > li:nth-child(2) > a.open-all-reviews"
    ).style.display = "block";
  });
  await page.click(
    "#user-review > div > div.block-foot > div > ul > li:nth-child(2) > a.open-all-reviews"
  );
  await page.waitForTimeout(4000);
  let page_count = parseInt(
    await page.$eval("#comment_pagination > ul > li:nth-child(6) > a", (e) =>
      e.getAttribute("data-page")
    )
  );
  await browser.close();
  console.log(page_count);
  return page_count;
};

const initialize = async (url, browser) => {
  console.log("VpnMentor started now.");
  let page_count = await get_page_and_browser_count(url, browser);
  console.log("Got the page count for VpnMentor");
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
  const { ScrapingJob, launch_browser } = require("../ScrapingJob.js");
  browser = await launch_browser();
  for (a = 0; a < counts.length; a++) {
    pages.push(await browser.newPage());
  }
  let Data = pages.map(async (page, idx) => {
    console.log("Inside the main function");
    return page
      .goto(`${url}`, {
        waitUntil: "networkidle2",
        timeout: 0,
      })
      .then(async () => {
        console.log("burdayıms");
        const output = await page.evaluate(
          async (idx, counts) => {
            console.log("buradayımm");
            let review_rating;
            let div = document.createElement("div");
            const fetch_api = async (vendor_id, i) => {
              return fetch(
                "https://www.vpnmentor.com/wp-content/themes/vpnmentor/get_paginated_comments.php",
                {
                  headers: {
                    accept: "*/*",
                    "accept-language": "tr-TR,tr;q=0.9",
                    "content-type":
                      "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                  },
                  referrerPolicy: "no-referrer",
                  body: `page=${i}&vendor_id=${vendor_id}&rating=&limit=10&vendor_tpl_version=v3`,
                  method: "POST",
                  mode: "cors",
                  credentials: "include",
                }
              )
                .then((resp) => {
                  return resp.text();
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
              let response = await fetch_api(vendor_id, i + 1);
              div.innerHTML = response;
              let reviews = div.querySelectorAll("div.comment-container");
              try {
                for (a = 0; a < reviews.length; a++) {
                  let rating = String(
                    reviews[a]
                      .querySelector("span.review-rating")
                      .textContent.trim()
                      .replaceAll(" ", "")
                      .replaceAll("-", "") / 2
                  );
                  let reviewtext = reviews[a]
                    .querySelector("p.review-comment")
                    .textContent.trim();
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
          counts
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
