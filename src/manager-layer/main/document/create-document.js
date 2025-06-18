const DocumentManager = require("./DocumentManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { DocumentCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateDocument } = require("dbLayer");

class CreateDocumentManager extends DocumentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createDocument",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "document";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.tenantId = this.tenantId;
    jsonObj.ownerUserId = this.ownerUserId;
    jsonObj.originalFilename = this.originalFilename;
    jsonObj.status = this.status;
    jsonObj.currentVersionId = this.currentVersionId;
    jsonObj.retentionPolicy = this.retentionPolicy;
    jsonObj.encryptionType = this.encryptionType;
  }

  readRestParameters(request) {
    this.tenantId = request.session?.tenantId;
    this.ownerUserId = request.session?.userId;
    this.originalFilename = request.body?.originalFilename;
    this.status = request.body?.status;
    this.currentVersionId = request.body?.currentVersionId;
    this.retentionPolicy = request.body?.retentionPolicy;
    this.encryptionType = request.body?.encryptionType;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    // ID
    if (
      this.tenantId &&
      !isValidObjectId(this.tenantId) &&
      !isValidUUID(this.tenantId)
    ) {
      throw new BadRequestError("errMsg_tenantIdisNotAValidID");
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
    // make an awaited call to the dbCreateDocument function to create the document and return the result to the controller
    const document = await dbCreateDocument(this);

    return document;
  }

  async raiseEvent() {
    DocumentCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.documentId = this.id;
    if (!this.documentId) this.documentId = newUUID(false);

    const dataClause = {
      id: this.documentId,
      tenantId: this.tenantId,
      ownerUserId: this.ownerUserId,
      originalFilename: this.originalFilename,
      status: this.status,
      currentVersionId: this.currentVersionId,
      retentionPolicy: this.retentionPolicy,
      encryptionType: this.encryptionType,
    };

    return dataClause;
  }
}

module.exports = CreateDocumentManager;
