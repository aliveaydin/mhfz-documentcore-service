const { DeleteDocumentManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class DeleteDocumentRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("deleteDocument", "deletedocument", req, res);
    this.dataName = "document";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteDocumentManager(this._req, "rest");
  }
}

const deleteDocument = async (req, res, next) => {
  const deleteDocumentRestController = new DeleteDocumentRestController(
    req,
    res,
  );
  try {
    await deleteDocumentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteDocument;
