const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { FileObject } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { FileObjectQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getFileObjectById = require("./utils/getFileObjectById");

class DbCreateFileobjectCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateFileobject";
    this.objectName = "fileObject";
    this.serviceLabel = "mhfz-documentcore-service";
    this.dbEvent = "mhfz-documentcore-service-dbevent-fileobject-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let fileObject = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        tenantId: this.dataClause.tenantId,
        integrityHash: this.dataClause.integrityHash,
      };

      fileObject =
        fileObject || (await FileObject.findOne({ where: whereClause }));

      if (fileObject) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" + "tenantId-integrityHash",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        fileObject =
          fileObject || (await FileObject.findByPk(this.dataClause.id));
        if (fileObject) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await fileObject.update(this.dataClause);
          updated = true;
        }
      }
    } catch (error) {
      const eDetail = {
        whereClause: this.normalizeSequalizeOps(whereClause),
        dataClause: this.dataClause,
        errorStack: error.stack,
        checkoutResult: this.input.checkoutResult,
      };
      throw new HttpServerError(
        "Error in checking unique index when creating FileObject",
        eDetail,
      );
    }

    if (!updated && !exists) {
      fileObject = await FileObject.create(this.dataClause);
    }

    this.dbData = fileObject.getData();
    this.input.fileObject = this.dbData;
    await this.create_childs();
  }
}

const dbCreateFileobject = async (input) => {
  const dbCreateCommand = new DbCreateFileobjectCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateFileobject;
