const { ListDocumentsManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class ListDocumentsRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("listDocuments", "listdocuments", req, res);
    this.dataName = "documents";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListDocumentsManager(this._req, "rest");
  }
}

const listDocuments = async (req, res, next) => {
  const listDocumentsRestController = new ListDocumentsRestController(req, res);
  try {
    await listDocumentsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listDocuments;
