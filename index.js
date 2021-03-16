const { ScrapingJob } = require("./ScrapingJob");
require("dotenv").config();
const express = require("express");

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
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
