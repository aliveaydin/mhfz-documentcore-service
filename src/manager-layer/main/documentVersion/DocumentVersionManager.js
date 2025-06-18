const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const DocumentCoreServiceManager = require("../../service-manager/DocumentCoreServiceManager");

/* Base Class For the Crud Routes Of DbObject DocumentVersion */
class DocumentVersionManager extends DocumentCoreServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "documentVersion";
    this.modelName = "DocumentVersion";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = DocumentVersionManager;
