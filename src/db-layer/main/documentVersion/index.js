const utils = require("./utils");

module.exports = {
  dbGetDocumentversion: require("./dbGetDocumentversion"),
  dbCreateDocumentversion: require("./dbCreateDocumentversion"),
  dbUpdateDocumentversion: require("./dbUpdateDocumentversion"),
  dbDeleteDocumentversion: require("./dbDeleteDocumentversion"),
  dbListDocumentversions: require("./dbListDocumentversions"),
  createDocumentVersion: utils.createDocumentVersion,
  getIdListOfDocumentVersionByField: utils.getIdListOfDocumentVersionByField,
  getDocumentVersionById: utils.getDocumentVersionById,
  getDocumentVersionAggById: utils.getDocumentVersionAggById,
  getDocumentVersionListByQuery: utils.getDocumentVersionListByQuery,
  getDocumentVersionStatsByQuery: utils.getDocumentVersionStatsByQuery,
  getDocumentVersionByQuery: utils.getDocumentVersionByQuery,
  updateDocumentVersionById: utils.updateDocumentVersionById,
  updateDocumentVersionByIdList: utils.updateDocumentVersionByIdList,
  updateDocumentVersionByQuery: utils.updateDocumentVersionByQuery,
  deleteDocumentVersionById: utils.deleteDocumentVersionById,
  deleteDocumentVersionByQuery: utils.deleteDocumentVersionByQuery,
};
