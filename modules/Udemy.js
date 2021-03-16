const puppeteer = require("puppeteer-core");
const proxyChain = require("proxy-chain");

//Siteye gir <body> içinde course id'yi çekip fetch içine koyup öyle request at!!!!!

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
        "https://www.udemy.com/course/amazon-dropshipping-fba-satici-egitimi/",
        {
          waitUntil: "networkidle2",
          timeout: 0,
        }
      )
      .then(async () => {
        const data = await page.evaluate(async () => {
          b = [];
          for (i = 1; i < 40; i++) {
            let response = await fetch(
              `https://www.udemy.com/api-2.0/courses/2160694/reviews/?courseId=2160694&page=${i}&is_text_review=1&ordering=course_review_score__rank,-created&fields[course_review]=@default,response,content_html,created_formatted_with_time_since&fields[user]=@min,image_50x50,initials&fields[course_review_response]=@min,user,content_html,created_formatted_with_time_since`,
              {
                headers: {
                  accept: "application/json, text/plain, */*",
                  "x-requested-with": "XMLHttpRequest",
                  "x-udemy-additional-context-requested":
                    '{"Config":true,"request":true}',
                  "x-udemy-cache-brand": "TRtr_TR",
                  "x-udemy-cache-campaign-code": "2020BLACKFRIDAY",
                  "x-udemy-cache-device": "desktop",
                  "x-udemy-cache-language": "tr",
                  "x-udemy-cache-logged-in": "0",
                  "x-udemy-cache-marketplace-country": "TR",
                  "x-udemy-cache-modern-browser": "1",
                  "x-udemy-cache-price-country": "TR",
                  "x-udemy-cache-release": "6b6b6cebeb16ca7861f1",
                  "x-udemy-cache-user": "",
                  "x-udemy-cache-version": "1",
                },
                referrer:
                  "https://www.udemy.com/course/amazon-dropshipping-fba-satici-egitimi/",
                referrerPolicy: "no-referrer-when-downgrade",
                body: null,
                method: "GET",
                mode: "cors",
                credentials: "omit",
              }
            );

            let resp = await response.json();
            for (a = 0; a < 12; a++) {
              b.push(resp["results"][a]);
            }
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
