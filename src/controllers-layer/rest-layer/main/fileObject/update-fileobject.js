const { UpdateFileobjectManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class UpdateFileobjectRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("updateFileobject", "updatefileobject", req, res);
    this.dataName = "fileObject";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateFileobjectManager(this._req, "rest");
  }
}

const updateFileobject = async (req, res, next) => {
  const updateFileobjectRestController = new UpdateFileobjectRestController(
    req,
    res,
  );
  try {
    await updateFileobjectRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateFileobject;
