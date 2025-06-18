const { ListDocumentversionsManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class ListDocumentversionsRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("listDocumentversions", "listdocumentversions", req, res);
    this.dataName = "documentVersions";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListDocumentversionsManager(this._req, "rest");
  }
}

const listDocumentversions = async (req, res, next) => {
  const listDocumentversionsRestController =
    new ListDocumentversionsRestController(req, res);
  try {
    await listDocumentversionsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listDocumentversions;
