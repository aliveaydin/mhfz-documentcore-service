const { DeleteDocumentversionManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class DeleteDocumentversionRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("deleteDocumentversion", "deletedocumentversion", req, res);
    this.dataName = "documentVersion";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteDocumentversionManager(this._req, "rest");
  }
}

const deleteDocumentversion = async (req, res, next) => {
  const deleteDocumentversionRestController =
    new DeleteDocumentversionRestController(req, res);
  try {
    await deleteDocumentversionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteDocumentversion;
