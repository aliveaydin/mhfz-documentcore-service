const { CreateDocumentManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class CreateDocumentRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("createDocument", "createdocument", req, res);
    this.dataName = "document";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateDocumentManager(this._req, "rest");
  }
}

const createDocument = async (req, res, next) => {
  const createDocumentRestController = new CreateDocumentRestController(
    req,
    res,
  );
  try {
    await createDocumentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createDocument;
