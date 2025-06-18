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

class DbGetFileobjectCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, FileObject);
    this.commandName = "dbGetFileobject";
    this.nullResult = false;
    this.objectName = "fileObject";
    this.serviceLabel = "mhfz-documentcore-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (FileObject.getCqrsJoins) await FileObject.getCqrsJoins(data);
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

const dbGetFileobject = (input) => {
  input.id = input.fileObjectId;
  const dbGetCommand = new DbGetFileobjectCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetFileobject;
