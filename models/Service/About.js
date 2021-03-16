const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.set("useFindAndModify", false);

const AboutSchema = new Schema({
  different_addresses: {
    type: String,
  },
  address: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  email_address: {
    type: String,
  },
  history: {
    type: String,
  },
});

module.exports = AboutSchema;
