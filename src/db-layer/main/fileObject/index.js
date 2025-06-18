const utils = require("./utils");

module.exports = {
  dbGetFileobject: require("./dbGetFileobject"),
  dbCreateFileobject: require("./dbCreateFileobject"),
  dbUpdateFileobject: require("./dbUpdateFileobject"),
  dbDeleteFileobject: require("./dbDeleteFileobject"),
  dbListFileobjects: require("./dbListFileobjects"),
  createFileObject: utils.createFileObject,
  getIdListOfFileObjectByField: utils.getIdListOfFileObjectByField,
  getFileObjectById: utils.getFileObjectById,
  getFileObjectAggById: utils.getFileObjectAggById,
  getFileObjectListByQuery: utils.getFileObjectListByQuery,
  getFileObjectStatsByQuery: utils.getFileObjectStatsByQuery,
  getFileObjectByQuery: utils.getFileObjectByQuery,
  updateFileObjectById: utils.updateFileObjectById,
  updateFileObjectByIdList: utils.updateFileObjectByIdList,
  updateFileObjectByQuery: utils.updateFileObjectByQuery,
  deleteFileObjectById: utils.deleteFileObjectById,
  deleteFileObjectByQuery: utils.deleteFileObjectByQuery,
  getFileObjectByIntegrityHash: utils.getFileObjectByIntegrityHash,
};
