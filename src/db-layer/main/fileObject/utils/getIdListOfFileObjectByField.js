const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { FileObject } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getIdListOfFileObjectByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const fileObjectProperties = [
      "id",
      "tenantId",
      "integrityHash",
      "sourceType",
      "sourceId",
      "sourceMeta",
      "fileSizeBytes",
    ];

    isValidField = fileObjectProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof FileObject[fieldName];

    if (typeof fieldValue !== expectedType) {
      throw new BadRequestError(
        `Invalid field value type for ${fieldName}. Expected ${expectedType}.`,
      );
    }

    const options = {
      where: isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true },
      attributes: ["id"],
    };

    let fileObjectIdList = await FileObject.findAll(options);

    if (!fileObjectIdList || fileObjectIdList.length === 0) {
      throw new NotFoundError(
        `FileObject with the specified criteria not found`,
      );
    }

    fileObjectIdList = fileObjectIdList.map((item) => item.id);
    return fileObjectIdList;
  } catch (err) {
    hexaLogger.insertError(
      "DatabaseError",
      { function: "getIdListOfFileObjectByField", fieldValue: fieldValue },
      "getIdListOfFileObjectByField.js->getIdListOfFileObjectByField",
      err,
      null,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingFileObjectIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfFileObjectByField;
