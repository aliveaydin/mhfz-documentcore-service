const FileObjectManager = require("./FileObjectManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { FileobjectCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateFileobject } = require("dbLayer");

class CreateFileobjectManager extends FileObjectManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createFileobject",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "fileObject";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.tenantId = this.tenantId;
    jsonObj.integrityHash = this.integrityHash;
    jsonObj.sourceType = this.sourceType;
    jsonObj.sourceId = this.sourceId;
    jsonObj.sourceMeta = this.sourceMeta;
    jsonObj.fileSizeBytes = this.fileSizeBytes;
  }

  readRestParameters(request) {
    this.tenantId = request.session?.tenantId;
    this.integrityHash = request.body?.integrityHash;
    this.sourceType = request.body?.sourceType;
    this.sourceId = request.body?.sourceId;
    this.sourceMeta = request.body?.sourceMeta;
    this.fileSizeBytes = request.body?.fileSizeBytes;
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
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.fileObject?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateFileobject function to create the fileobject and return the result to the controller
    const fileobject = await dbCreateFileobject(this);

    return fileobject;
  }

  async raiseEvent() {
    FileobjectCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.fileObjectId = this.id;
    if (!this.fileObjectId) this.fileObjectId = newUUID(false);

    const dataClause = {
      id: this.fileObjectId,
      tenantId: this.tenantId,
      integrityHash: this.integrityHash,
      sourceType: this.sourceType,
      sourceId: this.sourceId,
      sourceMeta: this.sourceMeta
        ? typeof this.sourceMeta == "string"
          ? JSON.parse(this.sourceMeta)
          : this.sourceMeta
        : null,
      fileSizeBytes: this.fileSizeBytes,
    };

    return dataClause;
  }
}

module.exports = CreateFileobjectManager;
