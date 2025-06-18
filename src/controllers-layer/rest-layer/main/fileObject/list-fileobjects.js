const { ListFileobjectsManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class ListFileobjectsRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("listFileobjects", "listfileobjects", req, res);
    this.dataName = "fileObjects";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListFileobjectsManager(this._req, "rest");
  }
}

const listFileobjects = async (req, res, next) => {
  const listFileobjectsRestController = new ListFileobjectsRestController(
    req,
    res,
  );
  try {
    await listFileobjectsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listFileobjects;
