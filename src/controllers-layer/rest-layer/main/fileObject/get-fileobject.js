const { GetFileobjectManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class GetFileobjectRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("getFileobject", "getfileobject", req, res);
    this.dataName = "fileObject";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetFileobjectManager(this._req, "rest");
  }
}

const getFileobject = async (req, res, next) => {
  const getFileobjectRestController = new GetFileobjectRestController(req, res);
  try {
    await getFileobjectRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getFileobject;
