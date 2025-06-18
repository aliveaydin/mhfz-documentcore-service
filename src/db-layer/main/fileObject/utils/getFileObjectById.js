const { HttpServerError } = require("common");

let { FileObject } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getFileObjectById = async (fileObjectId) => {
  try {
    const fileObject = Array.isArray(fileObjectId)
      ? await FileObject.findAll({
          where: {
            id: { [Op.in]: fileObjectId },
          },
        })
      : await FileObject.findByPk(fileObjectId);
    if (!fileObject) {
      return null;
    }
    return Array.isArray(fileObjectId)
      ? fileObject.map((item) => item.getData())
      : fileObject.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFileObjectById",
      err,
    );
  }
};

module.exports = getFileObjectById;
