const lambda = require("./index");

const event = {
  Records: [
    {
      messageAttributes: {
        url: {
          stringValue:
            "https://apps.apple.com/us/app/mcafee-endpoint-assistant/id797510089",
        },
        service: {
          stringValue: "6021df4fc10f945508415a91",
        },
        domain: {
          stringValue: "apple",
        },
        review_site_url_id: {
          stringValue: "602b317db5c6bf002805c319",
        },
      },
    },
  ],
};

lambda.handler(event);
