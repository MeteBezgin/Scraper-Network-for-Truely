const { ScrapingJob } = require("./ScrapingJob");
require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());
const port = 80;

app.post("/", (req, res) => {
  console.log(req.body);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
