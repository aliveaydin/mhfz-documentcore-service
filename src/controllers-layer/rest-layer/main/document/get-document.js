const { GetDocumentManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class GetDocumentRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("getDocument", "getdocument", req, res);
    this.dataName = "document";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetDocumentManager(this._req, "rest");
  }
}

const getDocument = async (req, res, next) => {
  const getDocumentRestController = new GetDocumentRestController(req, res);
  try {
    await getDocumentRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getDocument;
