const { HttpServerError, BadRequestError } = require("common");

const { Document } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getDocumentByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const document = await Document.findOne({ where: query });
    if (!document) return null;
    return document.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentByQuery",
      err,
    );
  }
};

module.exports = getDocumentByQuery;
