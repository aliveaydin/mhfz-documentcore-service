const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { DocumentVersion } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getIdListOfDocumentVersionByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const documentVersionProperties = [
      "id",
      "documentId",
      "versionNumber",
      "uploaderUserId",
      "fileObjectId",
      "uploadDate",
      "comment",
    ];

    isValidField = documentVersionProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof DocumentVersion[fieldName];

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

    let documentVersionIdList = await DocumentVersion.findAll(options);

    if (!documentVersionIdList || documentVersionIdList.length === 0) {
      throw new NotFoundError(
        `DocumentVersion with the specified criteria not found`,
      );
    }

    documentVersionIdList = documentVersionIdList.map((item) => item.id);
    return documentVersionIdList;
  } catch (err) {
    hexaLogger.insertError(
      "DatabaseError",
      { function: "getIdListOfDocumentVersionByField", fieldValue: fieldValue },
      "getIdListOfDocumentVersionByField.js->getIdListOfDocumentVersionByField",
      err,
      null,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingDocumentVersionIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfDocumentVersionByField;
