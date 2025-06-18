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

class DbGetDocumentCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, Document);
    this.commandName = "dbGetDocument";
    this.nullResult = false;
    this.objectName = "document";
    this.serviceLabel = "mhfz-documentcore-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (Document.getCqrsJoins) await Document.getCqrsJoins(data);
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

const dbGetDocument = (input) => {
  input.id = input.documentId;
  const dbGetCommand = new DbGetDocumentCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetDocument;
