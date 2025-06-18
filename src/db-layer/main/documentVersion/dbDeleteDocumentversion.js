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

const {
  getIdListOfDocumentByField,
  updateDocumentById,
  deleteDocumentById,
} = require("../document");

const {
  DocumentVersionQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteDocumentversionCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, DocumentVersion, instanceMode);
    this.commandName = "dbDeleteDocumentversion";
    this.nullResult = false;
    this.objectName = "documentVersion";
    this.serviceLabel = "mhfz-documentcore-service";
    this.dbEvent = "mhfz-documentcore-service-dbevent-documentversion-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
    await elasticIndexer.deleteData(this.dbData.id);
  }

  async transposeResult() {
    // transpose dbData
  }

  async syncJoins() {
    const promises = [];
    const dataId = this.dbData.id;
    // relationTargetKey should be used instead of id
    try {
      // delete refrring objects

      // update referring objects
      const idList_Document_currentVersionId_currentVersion =
        await getIdListOfDocumentByField(
          "currentVersionId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_Document_currentVersionId_currentVersion) {
        promises.push(updateDocumentById(itemId, { currentVersionId: null }));
      }

      // delete childs

      // update childs

      // delete & update parents ???

      // delete and update referred parents

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result instanceof Error) {
          console.log(
            "Single Error when synching delete of DocumentVersion on joined and parent objects:",
            dataId,
            result,
          );
          hexaLogger.insertError(
            "SyncJoinError",
            { function: "syncJoins", dataId: dataId },
            "->syncJoins",
            result,
          );
        }
      }
    } catch (err) {
      console.log(
        "Total Error when synching delete of DocumentVersion on joined and parent objects:",
        dataId,
        err,
      );
      hexaLogger.insertError(
        "SyncJoinsTotalError",
        { function: "syncJoins", dataId: dataId },
        "->syncJoins",
        err,
      );
    }
  }
}

const dbDeleteDocumentversion = async (input) => {
  input.id = input.documentVersionId;
  const dbDeleteCommand = new DbDeleteDocumentversionCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteDocumentversion;
