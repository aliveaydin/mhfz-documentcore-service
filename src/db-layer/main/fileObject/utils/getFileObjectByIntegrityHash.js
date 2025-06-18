const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { FileObject } = require("models");
const { Op } = require("sequelize");

const getFileObjectByIntegrityHash = async (integrityHash) => {
  try {
    const fileObject = await FileObject.findOne({
      where: { integrityHash: integrityHash },
    });
    if (!fileObject) {
      return null;
    }
    return fileObject.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFileObjectByIntegrityHash",
      err,
    );
  }
};

module.exports = getFileObjectByIntegrityHash;
