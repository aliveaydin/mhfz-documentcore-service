const FileObjectManager = require("./FileObjectManager");
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
const { dbGetFileobject } = require("dbLayer");

class GetFileobjectManager extends FileObjectManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getFileobject",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
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
    // make an awaited call to the dbGetFileobject function to get the fileobject and return the result to the controller
    const fileobject = await dbGetFileobject(this);

    return fileobject;
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
}

module.exports = GetFileobjectManager;
