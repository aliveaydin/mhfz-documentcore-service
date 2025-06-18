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

const {
  DocumentVersionQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getDocumentVersionById = require("./utils/getDocumentVersionById");

//not

class DbUpdateDocumentversionCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, DocumentVersion, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateDocumentversion";
    this.nullResult = false;
    this.objectName = "documentVersion";
    this.serviceLabel = "mhfz-documentcore-service";
    this.joinedCriteria = false;
    this.dbEvent = "mhfz-documentcore-service-dbevent-documentversion-updated";
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
    this.queryCacheInvalidator = new DocumentVersionQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "documentVersion",
      this.session,
      this.requestId,
    );
    const dbData = await getDocumentVersionById(this.dbData.id);
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

const dbUpdateDocumentversion = async (input) => {
  input.id = input.documentVersionId;
  const dbUpdateCommand = new DbUpdateDocumentversionCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateDocumentversion;
