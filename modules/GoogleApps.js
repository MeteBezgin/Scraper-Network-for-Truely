const gplay = require("google-play-scraper");

const initialize = async (url, browser) => {
  await browser.close();
  let f = url;
  var appId = f.split("?id=").pop().split("&")[0];
  console.log(appId);
  let data = await gplay
    .reviews({
      appId: `${appId}`,
      sort: gplay.sort.NEWEST,
      num: 5000,
    })
    .then((r) => {
      let a = [];
      for (i = 0; i < r.data.length; i++) {
        let b = { reviewtext: r.data[i].text, rating: r.data[i].score };
        a.push(b);
      }
      return a;
    })
    .catch((err) => {
      return err;
    });

  return data;
};

module.exports = {
  init: initialize,
};
