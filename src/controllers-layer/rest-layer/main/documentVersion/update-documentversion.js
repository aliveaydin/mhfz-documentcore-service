const { UpdateDocumentversionManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class UpdateDocumentversionRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("updateDocumentversion", "updatedocumentversion", req, res);
    this.dataName = "documentVersion";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateDocumentversionManager(this._req, "rest");
  }
}

const updateDocumentversion = async (req, res, next) => {
  const updateDocumentversionRestController =
    new UpdateDocumentversionRestController(req, res);
  try {
    await updateDocumentversionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateDocumentversion;
