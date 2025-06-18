const { UpdateDocumentManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class UpdateDocumentRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("updateDocument", "updatedocument", req, res);
    this.dataName = "document";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateDocumentManager(this._req, "rest");
  }
}

const updateDocument = async (req, res, next) => {
  const updateDocumentRestController = new UpdateDocumentRestController(
    req,
    res,
  );
  try {
    await updateDocumentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateDocument;
