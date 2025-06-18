module.exports = {
  sortVersions: require("./functions/sortVersions.js"),
  calculateIntegrityHash: require("./functions/calculateIntegrityHash.js"),
  ...require("./templates"),
};
