const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const DocumentCoreServiceManager = require("../../service-manager/DocumentCoreServiceManager");

/* Base Class For the Crud Routes Of DbObject Document */
class DocumentManager extends DocumentCoreServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "document";
    this.modelName = "Document";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = DocumentManager;
