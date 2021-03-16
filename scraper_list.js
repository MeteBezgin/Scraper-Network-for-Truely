const Amazon = require("./modules/Amazon"); //Done.
const AppleApps = require("./modules/AppleApps"); //Done.
const Capterra = require("./modules/Capterra");
const Consumeraffairs = require("./modules/Consumeraffairs"); //Done.
const Coursera = require("./modules/Coursera"); //Done.
const G2 = require("./modules/G2"); //Done.
const GetApp = require("./modules/GetApp");
const GoogleApps = require("./modules/GoogleApps");
const HostAdvice = require("./modules/HostAdvice"); //Done.
const PissedConsumer = require("./modules/PissedConsumer"); //Done.
const ProductReviewAu = require("./modules/ProductReview.au"); //Done.
const ResellerRatings = require("./modules/ResellerRatings"); //Done.
const Reviewsio = require("./modules/Reviews.io"); //Done.
const Skillshare = require("./modules/Skillshare");
const SoftwareAdvice = require("./modules/SoftwareAdvice"); //Done.
const TheBestVpn = require("./modules/TheBestVpn"); //Done.
const Trustpilot = require("./modules/Trustpilot"); //Done.
const Udemy = require("./modules/Udemy");
const VpnMentor = require("./modules/VpnMentor"); //Done.
const Walmart = require("./modules/Walmart"); //Done.
const SiteJabber = require("./modules/SiteJabber"); //Done.
const HostingFacts = require("./modules/HostingFacts"); //Done.

module.exports = {
  amazon: Amazon,
  softwareadvice: SoftwareAdvice,
  pissedconsumer: PissedConsumer,
  productreview: ProductReviewAu,
  resellerratings: ResellerRatings,
  reviews: Reviewsio,
  sitejabber: SiteJabber,
  skillshare: Skillshare,
  thebestvpn: TheBestVpn,
  trustpilot: Trustpilot,
  udemy: Udemy,
  vpnmentor: VpnMentor,
  walmart: Walmart,
  apple: AppleApps,
  capterra: Capterra,
  coursera: Coursera,
  g2: G2,
  google: GoogleApps,
  hostadvice: HostAdvice,
  hostingfacts: HostingFacts,
  consumeraffairs: Consumeraffairs,
  getapp: GetApp,
};
