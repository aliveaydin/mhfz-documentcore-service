const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { Document, DocumentVersion, FileObject } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");
const { hexaLogger } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const { DocumentQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getDocumentById = require("./utils/getDocumentById");

//not

class DbUpdateDocumentCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, Document, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateDocument";
    this.nullResult = false;
    this.objectName = "document";
    this.serviceLabel = "mhfz-documentcore-service";
    this.joinedCriteria = false;
    this.dbEvent = "mhfz-documentcore-service-dbevent-document-updated";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async transposeResult() {
    // transpose dbData
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new DocumentQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "document",
      this.session,
      this.requestId,
    );
    const dbData = await getDocumentById(this.dbData.id);
    await elasticIndexer.indexData(dbData);
  }

  async setCalculatedFieldsAfterInstance(data) {
    const input = this.input;
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbUpdateDocument = async (input) => {
  input.id = input.documentId;
  const dbUpdateCommand = new DbUpdateDocumentCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateDocument;
