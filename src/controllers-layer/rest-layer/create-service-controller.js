const DocumentCoreServiceRestController = require("./DocumentCoreServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new DocumentCoreServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
