const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { Document, DocumentVersion, FileObject } = require("models");

class DbListFileobjectsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListFileobjects";
    this.emptyResult = true;
    this.objectName = "fileObjects";
    this.serviceLabel = "mhfz-documentcore-service";
    this.input.pagination = null;
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async transposeResult() {
    for (const fileObject of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (FileObject.getCqrsJoins) {
      await FileObject.getCqrsJoins(item);
    }
  }

  async executeQuery() {
    const input = this.input;
    let options = { where: this.whereClause };
    if (input.sortBy) options.order = input.sortBy ?? [["id", "ASC"]];

    options.include = this.buildIncludes();
    if (options.include && options.include.length == 0) options.include = null;

    if (!input.getJoins) {
      options.include = null;
    }

    let fileObjects = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    fileObjects = await FileObject.findAll(options);

    return fileObjects;
  }
}

const dbListFileobjects = (input) => {
  const dbGetListCommand = new DbListFileobjectsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListFileobjects;
