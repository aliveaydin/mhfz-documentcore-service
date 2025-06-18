const DocumentVersionManager = require("./DocumentVersionManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  DocumentversionDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteDocumentversion } = require("dbLayer");

class DeleteDocumentversionManager extends DocumentVersionManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteDocumentversion",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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

  async fetchInstance() {
    const { getDocumentVersionById } = require("dbLayer");
    this.documentVersion = await getDocumentVersionById(this.documentVersionId);
    if (!this.documentVersion) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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
    // make an awaited call to the dbDeleteDocumentversion function to delete the documentversion and return the result to the controller
    const documentversion = await dbDeleteDocumentversion(this);

    return documentversion;
  }

  async raiseEvent() {
    DocumentversionDeletedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
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

module.exports = DeleteDocumentversionManager;
