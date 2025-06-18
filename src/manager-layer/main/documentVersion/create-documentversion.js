const DocumentVersionManager = require("./DocumentVersionManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  DocumentversionCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateDocumentversion } = require("dbLayer");

class CreateDocumentversionManager extends DocumentVersionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createDocumentversion",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "documentVersion";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.documentId = this.documentId;
    jsonObj.versionNumber = this.versionNumber;
    jsonObj.uploaderUserId = this.uploaderUserId;
    jsonObj.fileObjectId = this.fileObjectId;
    jsonObj.uploadDate = this.uploadDate;
    jsonObj.comment = this.comment;
  }

  readRestParameters(request) {
    this.documentId = request.body?.documentId;
    this.versionNumber = request.body?.versionNumber;
    this.uploaderUserId = request.session?.userId;
    this.fileObjectId = request.body?.fileObjectId;
    this.uploadDate = request.body?.uploadDate;
    this.comment = request.body?.comment;
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
      this.documentId &&
      !isValidObjectId(this.documentId) &&
      !isValidUUID(this.documentId)
    ) {
      throw new BadRequestError("errMsg_documentIdisNotAValidID");
    }

    // ID
    if (
      this.uploaderUserId &&
      !isValidObjectId(this.uploaderUserId) &&
      !isValidUUID(this.uploaderUserId)
    ) {
      throw new BadRequestError("errMsg_uploaderUserIdisNotAValidID");
    }

    // ID
    if (
      this.fileObjectId &&
      !isValidObjectId(this.fileObjectId) &&
      !isValidUUID(this.fileObjectId)
    ) {
      throw new BadRequestError("errMsg_fileObjectIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.documentVersion?.uploaderUserId === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateDocumentversion function to create the documentversion and return the result to the controller
    const documentversion = await dbCreateDocumentversion(this);

    return documentversion;
  }

  async raiseEvent() {
    DocumentversionCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.documentVersionId = this.id;
    if (!this.documentVersionId) this.documentVersionId = newUUID(false);

    const dataClause = {
      id: this.documentVersionId,
      documentId: this.documentId,
      versionNumber: this.versionNumber,
      uploaderUserId: this.uploaderUserId,
      fileObjectId: this.fileObjectId,
      uploadDate: this.uploadDate,
      comment: this.comment,
    };

    return dataClause;
  }
}

module.exports = CreateDocumentversionManager;
