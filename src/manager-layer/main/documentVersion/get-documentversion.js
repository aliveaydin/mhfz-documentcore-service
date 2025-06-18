const DocumentVersionManager = require("./DocumentVersionManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbGetDocumentversion } = require("dbLayer");

class GetDocumentversionManager extends DocumentVersionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getDocumentversion",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "documentVersion";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.documentVersionId = this.documentVersionId;
  }

  readRestParameters(request) {
    this.documentVersionId = request.params?.documentVersionId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.documentVersionId == null) {
      throw new BadRequestError("errMsg_documentVersionIdisRequired");
    }

    // ID
    if (
      this.documentVersionId &&
      !isValidObjectId(this.documentVersionId) &&
      !isValidUUID(this.documentVersionId)
    ) {
      throw new BadRequestError("errMsg_documentVersionIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.documentVersion?.uploaderUserId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetDocumentversion function to get the documentversion and return the result to the controller
    const documentversion = await dbGetDocumentversion(this);

    return documentversion;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.documentVersionId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetDocumentversionManager;
