const { sequelize } = require("common");
const { Op } = require("sequelize");
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");

const { Document, DocumentVersion, FileObject } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetDocumentversionCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, DocumentVersion);
    this.commandName = "dbGetDocumentversion";
    this.nullResult = false;
    this.objectName = "documentVersion";
    this.serviceLabel = "mhfz-documentcore-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (DocumentVersion.getCqrsJoins) await DocumentVersion.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
  }

  async transposeResult() {
    // transpose dbData
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbGetDocumentversion = (input) => {
  input.id = input.documentVersionId;
  const dbGetCommand = new DbGetDocumentversionCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetDocumentversion;
