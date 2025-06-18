const FileObjectManager = require("./FileObjectManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { FileobjectUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateFileobject } = require("dbLayer");

class UpdateFileobjectManager extends FileObjectManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateFileobject",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "fileObject";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.fileObjectId = this.fileObjectId;
  }

  readRestParameters(request) {
    this.fileObjectId = request.params?.fileObjectId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getFileObjectById } = require("dbLayer");
    this.fileObject = await getFileObjectById(this.fileObjectId);
    if (!this.fileObject) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.fileObjectId == null) {
      throw new BadRequestError("errMsg_fileObjectIdisRequired");
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

    this.isOwner = this.fileObject?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateFileobject function to update the fileobject and return the result to the controller
    const fileobject = await dbUpdateFileobject(this);

    return fileobject;
  }

  async raiseEvent() {
    FileobjectUpdatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ id: this.fileObjectId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {};

    return dataClause;
  }
}

module.exports = UpdateFileobjectManager;
