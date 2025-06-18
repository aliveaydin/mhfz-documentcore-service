const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const DocumentCoreServiceManager = require("../../service-manager/DocumentCoreServiceManager");

/* Base Class For the Crud Routes Of DbObject FileObject */
class FileObjectManager extends DocumentCoreServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "fileObject";
    this.modelName = "FileObject";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = FileObjectManager;
