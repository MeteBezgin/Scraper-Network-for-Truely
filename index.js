const { ScrapingJob } = require("./ScrapingJob");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

mongoose.connect(
  process.env.DATABASE_URL ||
    "mongodb+srv://mete:mete@cluster0.rolwo.mongodb.net/cc_backend?retryWrites=true&w=majority"
);

const app = express();
app.use(express.json());
const port = 80;

app.post("/", (req, res) => {
  console.log(req.body);
  let url = req.body.url;
  let service = req.body.service;
  let domain = req.body.domain;
  let review_site_url_id = req.body.review_site_url_id;
  ScrapingJob(url, service, review_site_url_id, domain);
  return res.status(200).json({
    message: "The scraper request has been sent successfully.",
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
