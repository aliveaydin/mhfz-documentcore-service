module.exports = {
  createSession: () => {
    const SessionManager = require("./mhfz-session");
    return new SessionManager();
  },
};
