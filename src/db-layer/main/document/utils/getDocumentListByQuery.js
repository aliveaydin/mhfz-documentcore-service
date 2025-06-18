const { HttpServerError, BadRequestError } = require("common");

const { Document } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getDocumentListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const document = await Document.findAll({ where: query });
    if (!document) return [];
    return document.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentListByQuery",
      err,
    );
  }
};

module.exports = getDocumentListByQuery;
