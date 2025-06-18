const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { Document, DocumentVersion, FileObject } = require("models");

class DbListDocumentversionsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListDocumentversions";
    this.emptyResult = true;
    this.objectName = "documentVersions";
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
    for (const documentVersion of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (DocumentVersion.getCqrsJoins) {
      await DocumentVersion.getCqrsJoins(item);
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

    let documentVersions = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    documentVersions = await DocumentVersion.findAll(options);

    return documentVersions;
  }
}

const dbListDocumentversions = (input) => {
  const dbGetListCommand = new DbListDocumentversionsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListDocumentversions;
