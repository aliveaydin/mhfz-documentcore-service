const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Document, DocumentVersion, FileObject } = require("models");
const { Op } = require("sequelize");

const getFileObjectAggById = async (fileObjectId) => {
  try {
    const forWhereClause = false;
    const includes = [];
    const fileObject = Array.isArray(fileObjectId)
      ? await FileObject.findAll({
          where: {
            id: { [Op.in]: fileObjectId },
          },
          include: includes,
        })
      : await FileObject.findByPk(fileObjectId, { include: includes });

    if (!fileObject) {
      return null;
    }

    const fileObjectData =
      Array.isArray(fileObjectId) && fileObjectId.length > 0
        ? fileObject.map((item) => item.getData())
        : fileObject.getData();
    await FileObject.getCqrsJoins(fileObjectData);
    return fileObjectData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFileObjectAggById",
      err,
    );
  }
};

module.exports = getFileObjectAggById;
