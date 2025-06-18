const { CreateFileobjectManager } = require("managers");

const DocumentCoreRestController = require("../../DocumentCoreServiceRestController");

class CreateFileobjectRestController extends DocumentCoreRestController {
  constructor(req, res) {
    super("createFileobject", "createfileobject", req, res);
    this.dataName = "fileObject";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateFileobjectManager(this._req, "rest");
  }
}

const createFileobject = async (req, res, next) => {
  const createFileobjectRestController = new CreateFileobjectRestController(
    req,
    res,
  );
  try {
    await createFileobjectRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createFileobject;
