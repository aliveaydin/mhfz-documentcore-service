const { HttpServerError } = require("common");

const { DocumentVersion } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const updateDocumentVersionByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;
    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };
    [rowsCount, rows] = await DocumentVersion.update(dataClause, options);
    const documentVersionIdList = rows.map((item) => item.id);
    return documentVersionIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingDocumentVersionByIdList",
      err,
    );
  }
};

module.exports = updateDocumentVersionByIdList;
