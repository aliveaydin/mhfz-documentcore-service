const { HttpServerError } = require("common");

const { Document } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const updateDocumentByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;
    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };
    [rowsCount, rows] = await Document.update(dataClause, options);
    const documentIdList = rows.map((item) => item.id);
    return documentIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingDocumentByIdList",
      err,
    );
  }
};

module.exports = updateDocumentByIdList;
