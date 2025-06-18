const crypto = require("crypto");
module.exports = function calculateIntegrityHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};
