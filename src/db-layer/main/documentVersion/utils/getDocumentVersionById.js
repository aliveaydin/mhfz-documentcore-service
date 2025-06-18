const { HttpServerError } = require("common");

let { DocumentVersion } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getDocumentVersionById = async (documentVersionId) => {
  try {
    const documentVersion = Array.isArray(documentVersionId)
      ? await DocumentVersion.findAll({
          where: {
            id: { [Op.in]: documentVersionId },
          },
        })
      : await DocumentVersion.findByPk(documentVersionId);
    if (!documentVersion) {
      return null;
    }
    return Array.isArray(documentVersionId)
      ? documentVersion.map((item) => item.getData())
      : documentVersion.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentVersionById",
      err,
    );
  }
};

module.exports = getDocumentVersionById;
