const { HttpServerError, BadRequestError } = require("common");

const { DocumentVersion } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getDocumentVersionListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const documentVersion = await DocumentVersion.findAll({ where: query });
    if (!documentVersion) return [];
    return documentVersion.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentVersionListByQuery",
      err,
    );
  }
};

module.exports = getDocumentVersionListByQuery;
