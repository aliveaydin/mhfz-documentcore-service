const { getDocumentById } = require("dbLayer");
const { getDocumentVersionById } = require("dbLayer");
const { getFileObjectById } = require("dbLayer");
const { Document } = require("models");
const { DocumentVersion } = require("models");
const { FileObject } = require("models");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");
const { Op } = require("sequelize");

const indexDocumentData = async () => {
  const documentIndexer = new ElasticIndexer("document", { isSilent: true });
  console.log("Starting to update indexes for Document");

  const idListData = await Document.findAll({
    attributes: ["id"],
  });
  const idList = idListData ? idListData.map((item) => item.id) : [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getDocumentById(chunk);
    if (dataList.length) {
      await documentIndexer.indexBulkData(dataList);
      await documentIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexDocumentVersionData = async () => {
  const documentVersionIndexer = new ElasticIndexer("documentVersion", {
    isSilent: true,
  });
  console.log("Starting to update indexes for DocumentVersion");

  const idListData = await DocumentVersion.findAll({
    attributes: ["id"],
  });
  const idList = idListData ? idListData.map((item) => item.id) : [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getDocumentVersionById(chunk);
    if (dataList.length) {
      await documentVersionIndexer.indexBulkData(dataList);
      await documentVersionIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexFileObjectData = async () => {
  const fileObjectIndexer = new ElasticIndexer("fileObject", {
    isSilent: true,
  });
  console.log("Starting to update indexes for FileObject");

  const idListData = await FileObject.findAll({
    attributes: ["id"],
  });
  const idList = idListData ? idListData.map((item) => item.id) : [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getFileObjectById(chunk);
    if (dataList.length) {
      await fileObjectIndexer.indexBulkData(dataList);
      await fileObjectIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexDocumentData();
    console.log(
      "Document agregated data is indexed, total documents:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing Document data",
      err.toString(),
    );
    hexaLogger.insertError(
      "ElasticIndexInitError",
      { function: "indexDocumentData" },
      "syncElasticIndexData.js->indexDocumentData",
      err,
    );
  }

  try {
    const dataCount = await indexDocumentVersionData();
    console.log(
      "DocumentVersion agregated data is indexed, total documentVersions:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing DocumentVersion data",
      err.toString(),
    );
    hexaLogger.insertError(
      "ElasticIndexInitError",
      { function: "indexDocumentVersionData" },
      "syncElasticIndexData.js->indexDocumentVersionData",
      err,
    );
  }

  try {
    const dataCount = await indexFileObjectData();
    console.log(
      "FileObject agregated data is indexed, total fileObjects:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing FileObject data",
      err.toString(),
    );
    hexaLogger.insertError(
      "ElasticIndexInitError",
      { function: "indexFileObjectData" },
      "syncElasticIndexData.js->indexFileObjectData",
      err,
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
