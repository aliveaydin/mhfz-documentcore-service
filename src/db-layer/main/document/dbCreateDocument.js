const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { Document } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { DocumentQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getDocumentById = require("./utils/getDocumentById");

class DbCreateDocumentCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateDocument";
    this.objectName = "document";
    this.serviceLabel = "mhfz-documentcore-service";
    this.dbEvent = "mhfz-documentcore-service-dbevent-document-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let document = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        tenantId: this.dataClause.tenantId,
        originalFilename: this.dataClause.originalFilename,
      };

      document = document || (await Document.findOne({ where: whereClause }));

      if (document) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" + "tenantId-originalFilename",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        document = document || (await Document.findByPk(this.dataClause.id));
        if (document) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await document.update(this.dataClause);
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
        "Error in checking unique index when creating Document",
        eDetail,
      );
    }

    if (!updated && !exists) {
      document = await Document.create(this.dataClause);
    }

    this.dbData = document.getData();
    this.input.document = this.dbData;
    await this.create_childs();
  }
}

const dbCreateDocument = async (input) => {
  const dbCreateCommand = new DbCreateDocumentCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateDocument;
