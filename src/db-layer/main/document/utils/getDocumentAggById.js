const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Document, DocumentVersion, FileObject } = require("models");
const { Op } = require("sequelize");

const getDocumentAggById = async (documentId) => {
  try {
    const forWhereClause = false;
    const includes = [];
    const document = Array.isArray(documentId)
      ? await Document.findAll({
          where: {
            id: { [Op.in]: documentId },
          },
          include: includes,
        })
      : await Document.findByPk(documentId, { include: includes });

    if (!document) {
      return null;
    }

    const documentData =
      Array.isArray(documentId) && documentId.length > 0
        ? document.map((item) => item.getData())
        : document.getData();
    await Document.getCqrsJoins(documentData);
    return documentData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentAggById",
      err,
    );
  }
};

module.exports = getDocumentAggById;
