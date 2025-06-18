const { HttpServerError, BadRequestError } = require("common");

const { FileObject } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getFileObjectListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const fileObject = await FileObject.findAll({ where: query });
    if (!fileObject) return [];
    return fileObject.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFileObjectListByQuery",
      err,
    );
  }
};

module.exports = getFileObjectListByQuery;
