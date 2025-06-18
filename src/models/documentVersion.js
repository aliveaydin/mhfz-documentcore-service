const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a single version of a document, tied to immutable file upload and uploader. Used for audit/versioning/restore.
const DocumentVersion = sequelize.define(
  "documentVersion",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    documentId: {
      // Parent business document id for this version.
      type: DataTypes.UUID,
      allowNull: false,
    },
    versionNumber: {
      // The version index (1 = first/original, increments with each upload).
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    uploaderUserId: {
      // ID of the user who uploaded this version.
      type: DataTypes.UUID,
      allowNull: false,
    },
    fileObjectId: {
      // ID of the file object associated with this version's physical asset.
      type: DataTypes.UUID,
      allowNull: false,
    },
    uploadDate: {
      // Timestamp when this version was uploaded.
      type: DataTypes.DATE,
      allowNull: false,
    },
    comment: {
      // Optional version comment/note.
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      // isActive property will be set to false when deleted
      // so that the document will be archived
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["documentId"],
      },

      {
        unique: true,
        fields: ["documentId", "versionNumber"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = DocumentVersion;
