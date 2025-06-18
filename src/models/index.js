const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const Document = require("./document");
const DocumentVersion = require("./documentVersion");
const FileObject = require("./fileObject");

Document.prototype.getData = function () {
  const data = this.dataValues;

  data.currentVersion = this.currentVersion
    ? this.currentVersion.getData()
    : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const statusOptions = ["active", "archived", "deleted", "locked"];
  const dataTypestatusDocument = typeof data.status;
  const enumIndexstatusDocument =
    dataTypestatusDocument === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusDocument;
  data.status =
    enumIndexstatusDocument > -1
      ? statusOptions[enumIndexstatusDocument]
      : undefined;

  data._owner = data.ownerUserId ?? undefined;
  return data;
};

Document.belongsTo(DocumentVersion, {
  as: "currentVersion",
  foreignKey: "currentVersionId",
  targetKey: "id",
  constraints: false,
});

DocumentVersion.prototype.getData = function () {
  const data = this.dataValues;

  data.document = this.document ? this.document.getData() : undefined;
  data.physicalFile = this.physicalFile
    ? this.physicalFile.getData()
    : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  data._owner = data.uploaderUserId ?? undefined;
  return data;
};

DocumentVersion.belongsTo(Document, {
  as: "document",
  foreignKey: "documentId",
  targetKey: "id",
  constraints: false,
});

DocumentVersion.belongsTo(FileObject, {
  as: "physicalFile",
  foreignKey: "fileObjectId",
  targetKey: "id",
  constraints: false,
});

FileObject.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const sourceTypeOptions = [
    "local",
    "googleDrive",
    "office365",
    "oneDrive",
    "url",
  ];
  const dataTypesourceTypeFileObject = typeof data.sourceType;
  const enumIndexsourceTypeFileObject =
    dataTypesourceTypeFileObject === "string"
      ? sourceTypeOptions.indexOf(data.sourceType)
      : data.sourceType;
  data.sourceType_idx = enumIndexsourceTypeFileObject;
  data.sourceType =
    enumIndexsourceTypeFileObject > -1
      ? sourceTypeOptions[enumIndexsourceTypeFileObject]
      : undefined;

  return data;
};

module.exports = {
  Document,
  DocumentVersion,
  FileObject,
  updateElasticIndexMappings,
};
