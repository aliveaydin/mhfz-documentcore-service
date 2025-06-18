const { HttpServerError, BadRequestError } = require("common");

const { FileObject } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getFileObjectByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const fileObject = await FileObject.findOne({ where: query });
    if (!fileObject) return null;
    return fileObject.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFileObjectByQuery",
      err,
    );
  }
};

module.exports = getFileObjectByQuery;
