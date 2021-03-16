const puppeteer = require("puppeteer-extra");
const proxyChain = require("proxy-chain");
const Scraper = require("./models/Scraper");
const Service = require("./models/Service");
const ParsedReview = require("./models/ParsedReview");
const scraper_list = require("./scraper_list");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const Category = require("./models/Category");
const SubCategory = require("./models/SubCategory");
const ReviewSite = require("./models/ReviewSite");
puppeteer.use(StealthPlugin());

const add_fields_to_reviews = (
  flatreviews,
  service,
  _reviewSite,
  url,
  sub_category
) => {
  for (i = 0; i < flatreviews.length; i++) {
    flatreviews[i].service = service;
    flatreviews[i].review_site = _reviewSite;
    flatreviews[i].url = url.split("?")[0];
    flatreviews[i].sub_category = sub_category;
  }
  return flatreviews;
};

const launch_browser = async function () {
  let username = process.env.PROXY_USERNAME;
  let password = process.env.PROXY_PASSWORD;
  let PROXY_RACK_DNS = process.env.PROXY_DNS;
  let PROXYRACK_PORT = process.env.PROXY_PORT;
  let browser;
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
  // If we're on production, use Browserless
  if (!process.env.DEVELOPMENT) {
    browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: "/usr/bin/chromium-browser",
      args: [
        `--proxy-server=${newProxyUrl}`,
        "--no-sandbox",
        "--headless",
        "--disable-gpu",
      ],
    });
  } else {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--proxy-server=${newProxyUrl}`,
        "--no-sandbox",
        "--headless",
        "--disable-gpu",
      ],
      executablePath: "/usr/bin/chromium-browser",
    });
  }
  return browser;
};

/**
 *
 * @param {Mongoose.ObjectID || String} _serviceID: ObjectID of the Service this scrapingJob belongs to. This is used to access review_site_urls object.
 * @param {Mongoose.ObjectID || String} _reviewSiteURLID: ID of the current review site url that is being processed. Used so we can delete it after the process or set Error.
 * @param {Function} scrapeFunction: Main scraping function defined in scraper modules.
 * @param {Boolean} withProxy
 */
const ScrapingJob = async (
  url,
  _serviceID,
  _reviewSiteURLID,
  domain,
  withProxy = true
) => {
  // Initialize a proxy
  console.log(
    `Starting scraping job for: \n URL: ${url} \n Service: ${_serviceID} \n ReviewSiteURLID: ${_reviewSiteURLID}`
  );
  // Find related documents and update their statuses
  // We want to make each review_site_url object sent to scrapers to become
  // Processing state.
  let service = await Service.findById(_serviceID, "review_sites sub_category");
  let review_site_url_object = service.review_sites.id(_reviewSiteURLID);
  let browser;
  review_site_url_object.status = "Processing";
  service.save().catch((err) => console.log(err.errorMessage));

  let sub_category = await SubCategory.findById(
    service.sub_category,
    "category"
  );
  let category = await Category.findById(
    sub_category.category,
    "_id main_category"
  );

  let review_site = await ReviewSite.findOne({ name: url.split("?")[0] });
  if (review_site) {
    await review_site.updateOne({
      $set: {
        domain,
        category: category._id,
        sub_category: sub_category._id,
        main_category: category.main_category,
        name: url.split("?")[0],
        service: _serviceID,
      },
    });
  } else {
    review_site = await new ReviewSite({
      domain,
      category: category._id,
      sub_category: sub_category._id,
      main_category: category.main_category,
      name: url.split("?")[0],
      service: _serviceID,
    }).save();
  }

  // Set scraper status to running, if doesn't exist yet, create one.
  await Scraper.updateOne(
    { name: domain },
    {
      name: domain,
      status: "Running",
      request: "False",
      last_invocation: new Date(),
    },
    {
      upsert: true,
    }
  ).exec();

  browser = await launch_browser();

  let scraperModule = scraper_list[domain];
  return scraperModule
    .init(url, browser)
    .then(async (reviews) => {
      let flatreviews = await reviews.flat(Infinity);
      let reviewslast = add_fields_to_reviews(
        flatreviews,
        _serviceID,
        review_site._id,
        url,
        sub_category._id
      );
      let scraper = await Scraper.findOne({ name: domain });
      return ParsedReview.insertMany(reviewslast, { ordered: false })
        .then(async () => {
          scraper.status = "Idle";
          review_site_url_object.status = "Processed";
          await scraper.save();
          await service.save();
          return "All done.";
        })
        .catch(async (err) => {
          let scraper = await Scraper.findOne({ name: domain });
          scraper.status = "Error";
          scraper.error = {
            err,
            service: _serviceID,
            url,
            _reviewSiteURLID,
            review_site,
          };
          review_site_url_object.status = "Error";
          await scraper.save();
          await service.save();
          console.log(err);
          return "Something went wrong.";
        });
    })
    .catch(async (err) => {
      let scraper = await Scraper.findOne({ name: domain });
      scraper.status = "Error";
      scraper.error = {
        err,
        service: _serviceID,
        url,
        _reviewSiteURLID,
        review_site,
      };
      review_site_url_object.status = "Error";
      await scraper.save();
      await service.save();
      return `Errored out with ${err}`;
    });
};

module.exports = { ScrapingJob, launch_browser };
