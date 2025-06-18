const utils = require("./utils");

module.exports = {
  dbGetDocument: require("./dbGetDocument"),
  dbCreateDocument: require("./dbCreateDocument"),
  dbUpdateDocument: require("./dbUpdateDocument"),
  dbDeleteDocument: require("./dbDeleteDocument"),
  dbListDocuments: require("./dbListDocuments"),
  createDocument: utils.createDocument,
  getIdListOfDocumentByField: utils.getIdListOfDocumentByField,
  getDocumentById: utils.getDocumentById,
  getDocumentAggById: utils.getDocumentAggById,
  getDocumentListByQuery: utils.getDocumentListByQuery,
  getDocumentStatsByQuery: utils.getDocumentStatsByQuery,
  getDocumentByQuery: utils.getDocumentByQuery,
  updateDocumentById: utils.updateDocumentById,
  updateDocumentByIdList: utils.updateDocumentByIdList,
  updateDocumentByQuery: utils.updateDocumentByQuery,
  deleteDocumentById: utils.deleteDocumentById,
  deleteDocumentByQuery: utils.deleteDocumentByQuery,
};
