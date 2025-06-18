const { HttpServerError, BadRequestError } = require("common");

const { DocumentVersion } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getDocumentVersionByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const documentVersion = await DocumentVersion.findOne({ where: query });
    if (!documentVersion) return null;
    return documentVersion.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentVersionByQuery",
      err,
    );
  }
};

module.exports = getDocumentVersionByQuery;
