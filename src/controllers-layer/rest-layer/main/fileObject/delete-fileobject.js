const { DeleteFileobjectManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class DeleteFileobjectRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("deleteFileobject", "deletefileobject", req, res);
    this.dataName = "fileObject";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteFileobjectManager(this._req, "rest");
  }
}

const deleteFileobject = async (req, res, next) => {
  const deleteFileobjectRestController = new DeleteFileobjectRestController(
    req,
    res,
  );
  try {
    await deleteFileobjectRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteFileobject;
