const { CreateDocumentversionManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class CreateDocumentversionRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("createDocumentversion", "createdocumentversion", req, res);
    this.dataName = "documentVersion";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateDocumentversionManager(this._req, "rest");
  }
}

const createDocumentversion = async (req, res, next) => {
  const createDocumentversionRestController =
    new CreateDocumentversionRestController(req, res);
  try {
    await createDocumentversionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createDocumentversion;
