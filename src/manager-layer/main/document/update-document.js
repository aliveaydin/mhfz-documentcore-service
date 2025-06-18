const DocumentManager = require("./DocumentManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { DocumentUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateDocument } = require("dbLayer");

class UpdateDocumentManager extends DocumentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateDocument",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "document";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.documentId = this.documentId;
    jsonObj.ownerUserId = this.ownerUserId;
    jsonObj.status = this.status;
    jsonObj.currentVersionId = this.currentVersionId;
    jsonObj.retentionPolicy = this.retentionPolicy;
    jsonObj.encryptionType = this.encryptionType;
  }

  readRestParameters(request) {
    this.documentId = request.params?.documentId;
    this.ownerUserId = request.session?.userId;
    this.status = request.body?.status;
    this.currentVersionId = request.body?.currentVersionId;
    this.retentionPolicy = request.body?.retentionPolicy;
    this.encryptionType = request.body?.encryptionType;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getDocumentById } = require("dbLayer");
    this.document = await getDocumentById(this.documentId);
    if (!this.document) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.documentId == null) {
      throw new BadRequestError("errMsg_documentIdisRequired");
    }

    if (this.status == null) {
      throw new BadRequestError("errMsg_statusisRequired");
    }

    // ID
    if (
      this.documentId &&
      !isValidObjectId(this.documentId) &&
      !isValidUUID(this.documentId)
    ) {
      throw new BadRequestError("errMsg_documentIdisNotAValidID");
    }

    // ID
    if (
      this.ownerUserId &&
      !isValidObjectId(this.ownerUserId) &&
      !isValidUUID(this.ownerUserId)
    ) {
      throw new BadRequestError("errMsg_ownerUserIdisNotAValidID");
    }

    // ID
    if (
      this.currentVersionId &&
      !isValidObjectId(this.currentVersionId) &&
      !isValidUUID(this.currentVersionId)
    ) {
      throw new BadRequestError("errMsg_currentVersionIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.document?.ownerUserId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateDocument function to update the document and return the result to the controller
    const document = await dbUpdateDocument(this);

    return document;
  }

  async raiseEvent() {
    DocumentUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      ownerUserId: this.ownerUserId,
      status: this.status,
      currentVersionId: this.currentVersionId,
      retentionPolicy: this.retentionPolicy,
      encryptionType: this.encryptionType,
    };

    return dataClause;
  }
}

module.exports = UpdateDocumentManager;
