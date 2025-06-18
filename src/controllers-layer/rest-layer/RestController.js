const { hexaLogger } = require("common");
const { createSessionManager } = require("sessionLayer");

class RestController {
  constructor(name, routeName, req, res) {
    this.name = name;
    this.routeName = routeName;
    this.apiManager = null;
    this.response = {};
    this.businessOutput = null;
    this.crudType = "get";
    this.status = 200;
    this.dataName = "resData";
    this._req = req;
    this._res = res;
    this.requestId = req.requestId;
    this.redirectUrl = null;
    this.projectCodename = null;
    this.isMultiTenant = false;
    this.tenantName = "tenant";
    this.tenantId = "tenantId";
    this.sessionManager = null;
  }

  async createApiManager() {}

  async init() {
    if (this.isMultiTenant) this.readTenant();
    this.sessionToken = this.readSessionToken();
    this._req.sessionToken = this.sessionToken;
    if (this.isMultiTenant) {
      this._req[this.tenantName + "Codename"] =
        this[this.tenantName + "Codename"];
      this._req[this.tenantId] = this[this.tenantId];
    }

    this.sessionManager = await createSessionManager(this._req);
    if (!["/login", "/linksession", "/favicon.ico"].includes(this._req.path))
      await this.sessionManager.verifySessionToken(this._req);

    if (this.isLoginApi) {
      if (
        this._req.session &&
        (this._req.userAuthUpdate || this._req.session.userAuthUpdate)
      ) {
        await this.sessionManager.relogin(this._req);
      }
    }
  }

  readTenant() {
    // read tenantId or tenantCodename from the request
    const request = this._req;
    const tenantIdHeaderName = `mbx-${this.tenantName}-id`;
    const tenantNameHeaderName = `mbx-${this.tenantName}-codename`;

    this[this.tenantId] =
      request.query["_" + this.tenantId] ?? request.headers[tenantIdHeaderName];
    // read tenant codename from header or query parameter
    this[this.tenantName + "Codename"] =
      request.query["_" + this.tenantName] ??
      request.headers[tenantNameHeaderName];
    if (!this[this.tenantName + "Codename"]) {
      // If the codename is not set, try to read it from the url path if exists with $
      const pathParts = request.path.split("/").filter(Boolean);
      if (pathParts.length > 0 && pathParts[0].startsWith("$")) {
        this[this.tenantName + "Codename"] = pathParts[0].substring(1);
        request.url = request.url.replace(`/${pathParts[0]}`, "");
      }
    }
  }

  getCookieToken(cookieName) {
    const request = this._req;
    if (!request || !request.headers) return null;
    const cookieHeader = request.headers?.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const tokenCookie = cookies.find((cookie) => {
        return cookie.startsWith(cookieName + "=");
      });

      if (tokenCookie) {
        return tokenCookie.split("=")[1];
      }
    }
  }

  getBearerToken() {
    const request = this._req;
    const authorization =
      request.headers.authorization || request.headers.Authorization;
    if (authorization) {
      const authParts = authorization.split(" ");
      if (authParts.length === 2) {
        if (authParts[0] === "Bearer" || authParts[0] === "bearer") {
          const bearerToken = authParts[1];
          if (bearerToken && bearerToken !== "null") {
            return bearerToken;
          }
        }
      }
    }

    return null;
  }

  readSessionToken() {
    const request = this._req;

    let sessionToken;
    sessionToken = request.query["access_token"];
    if (sessionToken) {
      console.log("Token extracted:", "query", "access_token");
      return sessionToken;
    }

    sessionToken = this.getBearerToken();
    if (sessionToken) {
      console.log("Token extracted:", "bearer token");
      return sessionToken;
    }

    if (this.isMultiTenant) {
      // check if there is any header of the application
      const tenantCodename = this[this.tenantName + "Codename"];
      const headerName =
        this.projectCodename + "-access-token-" + tenantCodename;
      sessionToken =
        request.headers[headerName] ||
        request.headers[headerName.toLowerCase()];
      if (sessionToken) {
        console.log("Tenant Token extracted:", "header", headerName);
        return sessionToken;
      }
    } else {
      // check if there is any header of the application
      const headerName = this.projectCodename + "-access-token-";
      sessionToken =
        request.headers[headerName] ||
        request.headers[headerName.toLowerCase()];
      if (sessionToken) {
        console.log("Token extracted:", "header", headerName);
        return sessionToken;
      }
    }

    if (this.isMultiTenant) {
      const tenantCodename = this[this.tenantName + "Codename"];
      const cookieName = `${this.projectCodename}-access-token-${tenantCodename}`;
      sessionToken = this.getCookieToken(cookieName, request);
      if (sessionToken) {
        console.log("Tenant Token extracted:", "cookie", cookieName);
        this.currentCookieName = cookieName;
        return sessionToken;
      }
    } else {
      const cookieName = `${this.projectCodename}-access-token`;
      sessionToken = this.getCookieToken(cookieName, request);
      if (sessionToken) {
        console.log("Token extracted:", "cookie", cookieName);
        this.currentCookieName = cookieName;
        return sessionToken;
      }
    }
    return null;
  }

  setTokenInResponse() {
    const tokenName = this.isMultiTenant
      ? `${this.projectCodename}-access-token-${this[this.tenantName + "Codename"]}`
      : `${this.projectCodename}-access-token`;
    if (this.sessionToken) {
      this._res.cookie(tokenName, this.sessionToken, {
        httpOnly: true,
        domain: process.env.COOKIE_URL,
        sameSite: "None",
        secure: true,
      });
      this._res.set(tokenName, this.sessionToken);
    }
  }

  clearCookie() {
    const tokenName = this.isMultiTenant
      ? `${this.projectCodename}-access-token-${this[this.tenantName + "Codename"]}`
      : `${this.projectCodename}-access-token`;
    this._res.clearCookie(tokenName, {
      httpOnly: true,
      domain: process.env.COOKIE_URL,
      sameSite: "None",
      secure: true,
    });
  }

  async redirect() {
    if (this.redirectUrl || this.apiManager.redirectUrl)
      return this._res.redirect(
        this.apiManager.redirectUrl ?? this.redirectUrl,
      );
    return false;
  }

  async doDownload() {
    return await this.apiManager.doDownload(this._res);
  }

  async _logRequest() {
    hexaLogger.insertInfo(
      "RestRequestReceived",
      { function: this.name },
      `${this.routeName}.js->${this.name}`,
      {
        method: this._req.method,
        url: this._req.url,
        body: this._req.body,
        query: this._req.query,
        params: this._req.params,
        headers: this._req.headers,
      },
      this.requestId,
    );
  }

  async _logResponse() {
    hexaLogger.insertInfo(
      "RestRequestResponded",
      { function: this.name },
      `${this.routeName}.js->${this.name}`,
      this.response,
      this.requestId,
    );
  }

  async _logError(err) {
    hexaLogger.insertError(
      "ErrorInRestRequest",
      { function: this.name, err: err.message },
      `${this.routeName}.js->${this.name}`,
      err,
      this.requestId,
    );
  }

  async processRequest() {
    await this._logRequest();

    try {
      await this.init();
      this.apiManager = await this.createApiManager(this._req);
      this.startTime = Date.now();
      this.response = await this.apiManager.execute();
      this.response.httpStatus = this.status;

      if (this.apiManager.setCookie) {
        this._res.cookie(
          this.apiManager.setCookie.cookieName,
          this.apiManager.setCookie.cookieValue,
          {
            httpOnly: true,
            domain: process.env.COOKIE_URL,
            sameSite: "None",
            secure: true,
          },
        );
      }

      if (this.isLoginApi) {
        this.sessionToken = this._req.sessionToken;
        this.setTokenInResponse();
      }

      if (!(await this.redirect()) && !(await this.doDownload())) {
        this._res.status(this.status).send(this.response);
      }
      await this._logResponse();
    } catch (err) {
      await this._logError(err);
      throw err;
    }
  }
}

module.exports = RestController;
