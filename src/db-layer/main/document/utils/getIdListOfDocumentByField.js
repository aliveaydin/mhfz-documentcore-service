const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Document } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getIdListOfDocumentByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const documentProperties = [
      "id",
      "tenantId",
      "ownerUserId",
      "originalFilename",
      "status",
      "currentVersionId",
      "retentionPolicy",
      "encryptionType",
    ];

    isValidField = documentProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof Document[fieldName];

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

    let documentIdList = await Document.findAll(options);

    if (!documentIdList || documentIdList.length === 0) {
      throw new NotFoundError(`Document with the specified criteria not found`);
    }

    documentIdList = documentIdList.map((item) => item.id);
    return documentIdList;
  } catch (err) {
    hexaLogger.insertError(
      "DatabaseError",
      { function: "getIdListOfDocumentByField", fieldValue: fieldValue },
      "getIdListOfDocumentByField.js->getIdListOfDocumentByField",
      err,
      null,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfDocumentByField;
