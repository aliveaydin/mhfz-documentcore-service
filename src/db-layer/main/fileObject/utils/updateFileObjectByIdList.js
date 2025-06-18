const { HttpServerError } = require("common");

const { FileObject } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const updateFileObjectByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;
    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };
    [rowsCount, rows] = await FileObject.update(dataClause, options);
    const fileObjectIdList = rows.map((item) => item.id);
    return fileObjectIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingFileObjectByIdList",
      err,
    );
  }
};

module.exports = updateFileObjectByIdList;
