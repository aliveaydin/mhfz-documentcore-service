module.exports = {
  DocumentCoreServiceManager: require("./service-manager/DocumentCoreServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // Document Db Object
  GetDocumentManager: require("./main/document/get-document"),
  CreateDocumentManager: require("./main/document/create-document"),
  UpdateDocumentManager: require("./main/document/update-document"),
  DeleteDocumentManager: require("./main/document/delete-document"),
  ListDocumentsManager: require("./main/document/list-documents"),
  // DocumentVersion Db Object
  GetDocumentversionManager: require("./main/documentVersion/get-documentversion"),
  CreateDocumentversionManager: require("./main/documentVersion/create-documentversion"),
  UpdateDocumentversionManager: require("./main/documentVersion/update-documentversion"),
  DeleteDocumentversionManager: require("./main/documentVersion/delete-documentversion"),
  ListDocumentversionsManager: require("./main/documentVersion/list-documentversions"),
  // FileObject Db Object
  GetFileobjectManager: require("./main/fileObject/get-fileobject"),
  CreateFileobjectManager: require("./main/fileObject/create-fileobject"),
  UpdateFileobjectManager: require("./main/fileObject/update-fileobject"),
  DeleteFileobjectManager: require("./main/fileObject/delete-fileobject"),
  ListFileobjectsManager: require("./main/fileObject/list-fileobjects"),
};
