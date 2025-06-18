const DocumentManager = require("./DocumentManager");
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
const { dbGetDocument } = require("dbLayer");

class GetDocumentManager extends DocumentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getDocument",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "document";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.documentId = this.documentId;
  }

  readRestParameters(request) {
    this.documentId = request.params?.documentId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.documentId == null) {
      throw new BadRequestError("errMsg_documentIdisRequired");
    }

    // ID
    if (
      this.documentId &&
      !isValidObjectId(this.documentId) &&
      !isValidUUID(this.documentId)
    ) {
      throw new BadRequestError("errMsg_documentIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.document?.ownerUserId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetDocument function to get the document and return the result to the controller
    const document = await dbGetDocument(this);

    return document;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.documentId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetDocumentManager;
