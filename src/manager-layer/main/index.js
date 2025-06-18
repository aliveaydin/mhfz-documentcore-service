module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // Document Db Object
  GetDocumentManager: require("./document/get-document"),
  CreateDocumentManager: require("./document/create-document"),
  UpdateDocumentManager: require("./document/update-document"),
  DeleteDocumentManager: require("./document/delete-document"),
  ListDocumentsManager: require("./document/list-documents"),
  // DocumentVersion Db Object
  GetDocumentversionManager: require("./documentVersion/get-documentversion"),
  CreateDocumentversionManager: require("./documentVersion/create-documentversion"),
  UpdateDocumentversionManager: require("./documentVersion/update-documentversion"),
  DeleteDocumentversionManager: require("./documentVersion/delete-documentversion"),
  ListDocumentversionsManager: require("./documentVersion/list-documentversions"),
  // FileObject Db Object
  GetFileobjectManager: require("./fileObject/get-fileobject"),
  CreateFileobjectManager: require("./fileObject/create-fileobject"),
  UpdateFileobjectManager: require("./fileObject/update-fileobject"),
  DeleteFileobjectManager: require("./fileObject/delete-fileobject"),
  ListFileobjectsManager: require("./fileObject/list-fileobjects"),
};
