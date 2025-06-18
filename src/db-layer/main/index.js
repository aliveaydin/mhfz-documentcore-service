const documentFunctions = require("./document");
const documentVersionFunctions = require("./documentVersion");
const fileObjectFunctions = require("./fileObject");

module.exports = {
  // main Database
  // Document Db Object
  dbGetDocument: documentFunctions.dbGetDocument,
  dbCreateDocument: documentFunctions.dbCreateDocument,
  dbUpdateDocument: documentFunctions.dbUpdateDocument,
  dbDeleteDocument: documentFunctions.dbDeleteDocument,
  dbListDocuments: documentFunctions.dbListDocuments,
  createDocument: documentFunctions.createDocument,
  getIdListOfDocumentByField: documentFunctions.getIdListOfDocumentByField,
  getDocumentById: documentFunctions.getDocumentById,
  getDocumentAggById: documentFunctions.getDocumentAggById,
  getDocumentListByQuery: documentFunctions.getDocumentListByQuery,
  getDocumentStatsByQuery: documentFunctions.getDocumentStatsByQuery,
  getDocumentByQuery: documentFunctions.getDocumentByQuery,
  updateDocumentById: documentFunctions.updateDocumentById,
  updateDocumentByIdList: documentFunctions.updateDocumentByIdList,
  updateDocumentByQuery: documentFunctions.updateDocumentByQuery,
  deleteDocumentById: documentFunctions.deleteDocumentById,
  deleteDocumentByQuery: documentFunctions.deleteDocumentByQuery,
  // DocumentVersion Db Object
  dbGetDocumentversion: documentVersionFunctions.dbGetDocumentversion,
  dbCreateDocumentversion: documentVersionFunctions.dbCreateDocumentversion,
  dbUpdateDocumentversion: documentVersionFunctions.dbUpdateDocumentversion,
  dbDeleteDocumentversion: documentVersionFunctions.dbDeleteDocumentversion,
  dbListDocumentversions: documentVersionFunctions.dbListDocumentversions,
  createDocumentVersion: documentVersionFunctions.createDocumentVersion,
  getIdListOfDocumentVersionByField:
    documentVersionFunctions.getIdListOfDocumentVersionByField,
  getDocumentVersionById: documentVersionFunctions.getDocumentVersionById,
  getDocumentVersionAggById: documentVersionFunctions.getDocumentVersionAggById,
  getDocumentVersionListByQuery:
    documentVersionFunctions.getDocumentVersionListByQuery,
  getDocumentVersionStatsByQuery:
    documentVersionFunctions.getDocumentVersionStatsByQuery,
  getDocumentVersionByQuery: documentVersionFunctions.getDocumentVersionByQuery,
  updateDocumentVersionById: documentVersionFunctions.updateDocumentVersionById,
  updateDocumentVersionByIdList:
    documentVersionFunctions.updateDocumentVersionByIdList,
  updateDocumentVersionByQuery:
    documentVersionFunctions.updateDocumentVersionByQuery,
  deleteDocumentVersionById: documentVersionFunctions.deleteDocumentVersionById,
  deleteDocumentVersionByQuery:
    documentVersionFunctions.deleteDocumentVersionByQuery,
  // FileObject Db Object
  dbGetFileobject: fileObjectFunctions.dbGetFileobject,
  dbCreateFileobject: fileObjectFunctions.dbCreateFileobject,
  dbUpdateFileobject: fileObjectFunctions.dbUpdateFileobject,
  dbDeleteFileobject: fileObjectFunctions.dbDeleteFileobject,
  dbListFileobjects: fileObjectFunctions.dbListFileobjects,
  createFileObject: fileObjectFunctions.createFileObject,
  getIdListOfFileObjectByField:
    fileObjectFunctions.getIdListOfFileObjectByField,
  getFileObjectById: fileObjectFunctions.getFileObjectById,
  getFileObjectAggById: fileObjectFunctions.getFileObjectAggById,
  getFileObjectListByQuery: fileObjectFunctions.getFileObjectListByQuery,
  getFileObjectStatsByQuery: fileObjectFunctions.getFileObjectStatsByQuery,
  getFileObjectByQuery: fileObjectFunctions.getFileObjectByQuery,
  updateFileObjectById: fileObjectFunctions.updateFileObjectById,
  updateFileObjectByIdList: fileObjectFunctions.updateFileObjectByIdList,
  updateFileObjectByQuery: fileObjectFunctions.updateFileObjectByQuery,
  deleteFileObjectById: fileObjectFunctions.deleteFileObjectById,
  deleteFileObjectByQuery: fileObjectFunctions.deleteFileObjectByQuery,
  getFileObjectByIntegrityHash:
    fileObjectFunctions.getFileObjectByIntegrityHash,
};
