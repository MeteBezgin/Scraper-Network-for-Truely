const mongoose = require("mongoose");
const ProCon = require("../ProCon");
const PlanSchema = require("./Plan");
const AboutSchema = require("./About");
const { PostDelete } = require("../../middlewares");
const { paramCase } = require("change-case");
const ParsedReview = require("../ParsedReview");
const { Schema } = mongoose;
mongoose.set("useFindAndModify", false);

const ReviewSiteURLSchema = new Schema({
  description: String,
  url: { type: String, required: true },
  type: { type: String },
  status: {
    type: String,
    enum: ["Processed", "Error", "Not Sent", "Processing"],
    default: "Not Sent",
  },
});

const ProsConsStatusSchema = new Schema({
  message: String,
  lastUpdated: Date,
  status: {
    type: String,
    enum: ["Completed", "Processing", "Error", "Not Created"],
    default: "Not Created",
  },
});

const OfferSchema = new Schema({
  discount: Number,
  bodyText: String,
  buttonText: String,
});

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    geo: { type: String, required: true },
    url: { type: String },
    language: { type: String },
    request_status: {
      type: String,
      enum: [
        "Parsed",
        "Processing",
        "No Action",
        "Error",
        "Task Complete",
        "Waiting Result",
      ],
      default: "No Action",
    },
    meta_description: String,
    description: String,
    live_status: {
      type: String,
      enum: ["Live", "Draft"],
      default: "Draft",
    },
    offer: { OfferSchema },
    pros_cons_status: { ProsConsStatusSchema },
    icon: String,
    review_sites: [ReviewSiteURLSchema],
    scores: [
      {
        type: Number,
        min: 0,
        max: 100,
      },
    ],
    overall_score: Number,
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      default: function () {
        return paramCase(this.name);
      },
    },
    content: Object,
    features: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
    dataforseo: { type: Object, default: {} },
    affiliate_link: { type: String },
    plans: [PlanSchema],
    about: AboutSchema,
  },
  { timestamps: true }
);

ServiceSchema.index({ updatedAt: 1 });
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ sub_category: 1 });

/**
 * Delete all pros_cons objects that has this service set as theirs.
 */
ServiceSchema.pre("deleteOne", async function () {
  let proscons = await ProCon.find({ service: this._id }).exec();
  let reviews = await ParsedReview.find({ service: this._id }).exec();
  await Promise.all([
    proscons.map((p) => p.deleteOne()),
    reviews.map((r) => r.deleteOne()),
  ]);
});

module.exports = Service = mongoose.model("Service", PostDelete(ServiceSchema));
