const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { DocumentVersion } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  DocumentVersionQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getDocumentVersionById = require("./utils/getDocumentVersionById");

class DbCreateDocumentversionCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateDocumentversion";
    this.objectName = "documentVersion";
    this.serviceLabel = "mhfz-documentcore-service";
    this.dbEvent = "mhfz-documentcore-service-dbevent-documentversion-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let documentVersion = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        documentId: this.dataClause.documentId,
        versionNumber: this.dataClause.versionNumber,
      };

      documentVersion =
        documentVersion ||
        (await DocumentVersion.findOne({ where: whereClause }));

      if (documentVersion) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" + "documentId-versionNumber",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        documentVersion =
          documentVersion ||
          (await DocumentVersion.findByPk(this.dataClause.id));
        if (documentVersion) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await documentVersion.update(this.dataClause);
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
        "Error in checking unique index when creating DocumentVersion",
        eDetail,
      );
    }

    if (!updated && !exists) {
      documentVersion = await DocumentVersion.create(this.dataClause);
    }

    this.dbData = documentVersion.getData();
    this.input.documentVersion = this.dbData;
    await this.create_childs();
  }
}

const dbCreateDocumentversion = async (input) => {
  const dbCreateCommand = new DbCreateDocumentversionCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateDocumentversion;
