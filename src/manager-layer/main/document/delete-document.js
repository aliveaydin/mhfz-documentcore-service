const DocumentManager = require("./DocumentManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { DocumentDeletedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteDocument } = require("dbLayer");

class DeleteDocumentManager extends DocumentManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteDocument",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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
    // make an awaited call to the dbDeleteDocument function to delete the document and return the result to the controller
    const document = await dbDeleteDocument(this);

    return document;
  }

  async raiseEvent() {
    DocumentDeletedPublisher.Publish(this.output, this.session).catch((err) => {
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
}

module.exports = DeleteDocumentManager;
