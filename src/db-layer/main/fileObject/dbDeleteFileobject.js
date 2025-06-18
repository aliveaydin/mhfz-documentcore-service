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

const {
  getIdListOfDocumentVersionByField,
  updateDocumentVersionById,
  deleteDocumentVersionById,
} = require("../documentVersion");

const { FileObjectQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteFileobjectCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, FileObject, instanceMode);
    this.commandName = "dbDeleteFileobject";
    this.nullResult = false;
    this.objectName = "fileObject";
    this.serviceLabel = "mhfz-documentcore-service";
    this.dbEvent = "mhfz-documentcore-service-dbevent-fileobject-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
      const idList_DocumentVersion_fileObjectId_physicalFile =
        await getIdListOfDocumentVersionByField(
          "fileObjectId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_DocumentVersion_fileObjectId_physicalFile) {
        promises.push(
          updateDocumentVersionById(itemId, { fileObjectId: null }),
        );
      }

      // delete childs

      // update childs

      // delete & update parents ???

      // delete and update referred parents

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result instanceof Error) {
          console.log(
            "Single Error when synching delete of FileObject on joined and parent objects:",
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
        "Total Error when synching delete of FileObject on joined and parent objects:",
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

const dbDeleteFileobject = async (input) => {
  input.id = input.fileObjectId;
  const dbDeleteCommand = new DbDeleteFileobjectCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteFileobject;
