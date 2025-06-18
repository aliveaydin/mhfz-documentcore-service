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

const { FileObjectQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getFileObjectById = require("./utils/getFileObjectById");

//not

class DbUpdateFileobjectCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, FileObject, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateFileobject";
    this.nullResult = false;
    this.objectName = "fileObject";
    this.serviceLabel = "mhfz-documentcore-service";
    this.joinedCriteria = false;
    this.dbEvent = "mhfz-documentcore-service-dbevent-fileobject-updated";
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
    this.queryCacheInvalidator = new FileObjectQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "fileObject",
      this.session,
      this.requestId,
    );
    const dbData = await getFileObjectById(this.dbData.id);
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

const dbUpdateFileobject = async (input) => {
  input.id = input.fileObjectId;
  const dbUpdateCommand = new DbUpdateFileobjectCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateFileobject;
