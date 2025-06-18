const { GetDocumentversionManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class GetDocumentversionRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("getDocumentversion", "getdocumentversion", req, res);
    this.dataName = "documentVersion";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetDocumentversionManager(this._req, "rest");
  }
}

const getDocumentversion = async (req, res, next) => {
  const getDocumentversionRestController = new GetDocumentversionRestController(
    req,
    res,
  );
  try {
    await getDocumentversionRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getDocumentversion;
