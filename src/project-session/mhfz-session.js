const { NotAuthenticatedError, ForbiddenError } = require("common");
const { hexaLogger } = require("common");
const HexaAuth = require("./hexa-auth");

class MhfzSession extends HexaAuth {
  constructor() {
    super();
    this.ROLES = {};

    this.projectName = "mhfz";
    this.projectCodename = "mhfz";
    this.isJWT = true;
    this.isJWTAuthRSA = true;
    this.isRemoteAuth = false;
    this.useRemoteSession = false;
  }
}

module.exports = MhfzSession;
