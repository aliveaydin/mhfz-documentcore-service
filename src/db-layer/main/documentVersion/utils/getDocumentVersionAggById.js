const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Document, DocumentVersion, FileObject } = require("models");
const { Op } = require("sequelize");

const getDocumentVersionAggById = async (documentVersionId) => {
  try {
    const forWhereClause = false;
    const includes = [];
    const documentVersion = Array.isArray(documentVersionId)
      ? await DocumentVersion.findAll({
          where: {
            id: { [Op.in]: documentVersionId },
          },
          include: includes,
        })
      : await DocumentVersion.findByPk(documentVersionId, {
          include: includes,
        });

    if (!documentVersion) {
      return null;
    }

    const documentVersionData =
      Array.isArray(documentVersionId) && documentVersionId.length > 0
        ? documentVersion.map((item) => item.getData())
        : documentVersion.getData();
    await DocumentVersion.getCqrsJoins(documentVersionData);
    return documentVersionData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentVersionAggById",
      err,
    );
  }
};

module.exports = getDocumentVersionAggById;
