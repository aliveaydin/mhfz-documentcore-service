const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  DocumentCoreServiceRestController: require("./DocumentCoreServiceRestController"),
  ...sessionRouter,
};
