const { HttpServerError } = require("common");

let { Document } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getDocumentById = async (documentId) => {
  try {
    const document = Array.isArray(documentId)
      ? await Document.findAll({
          where: {
            id: { [Op.in]: documentId },
          },
        })
      : await Document.findByPk(documentId);
    if (!document) {
      return null;
    }
    return Array.isArray(documentId)
      ? document.map((item) => item.getData())
      : document.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingDocumentById", err);
  }
};

module.exports = getDocumentById;
