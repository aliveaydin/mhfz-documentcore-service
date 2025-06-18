const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const documentMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  tenantId: { type: "keyword", index: true },
  ownerUserId: { type: "keyword", index: true },
  originalFilename: { type: "keyword", index: true },
  status: { type: "keyword", index: true },
  status_: { type: "keyword" },
  currentVersionId: { type: "keyword", index: false },
  retentionPolicy: { type: "keyword", index: true },
  encryptionType: { type: "keyword", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const documentVersionMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  documentId: { type: "keyword", index: true },
  versionNumber: { type: "integer", index: true },
  uploaderUserId: { type: "keyword", index: false },
  fileObjectId: { type: "keyword", index: false },
  uploadDate: { type: "date", index: true },
  comment: { type: "keyword", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const fileObjectMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  tenantId: { type: "keyword", index: true },
  integrityHash: { type: "keyword", index: false },
  sourceType: { type: "keyword", index: true },
  sourceType_: { type: "keyword" },
  sourceId: { type: "keyword", index: false },
  sourceMeta: { type: "object", enabled: false },
  fileSizeBytes: { type: "integer", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("document", documentMapping);
    await new ElasticIndexer("document").updateMapping(documentMapping);
    ElasticIndexer.addMapping("documentVersion", documentVersionMapping);
    await new ElasticIndexer("documentVersion").updateMapping(
      documentVersionMapping,
    );
    ElasticIndexer.addMapping("fileObject", fileObjectMapping);
    await new ElasticIndexer("fileObject").updateMapping(fileObjectMapping);
  } catch (err) {
    hexaLogger.insertError(
      "UpdateElasticIndexMappingsError",
      { function: "updateElasticIndexMappings" },
      "elastic-index.js->updateElasticIndexMappings",
      err,
    );
  }
};

module.exports = updateElasticIndexMappings;
