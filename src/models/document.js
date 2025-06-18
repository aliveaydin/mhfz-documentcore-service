const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a unique business document with base properties, status, current version pointer, access/owner, and retention attributes.
const Document = sequelize.define(
  "document",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    tenantId: {
      // Tenant/organization ID owning the document.
      type: DataTypes.UUID,
      allowNull: false,
    },
    ownerUserId: {
      // User ID for the original uploader/owner.
      type: DataTypes.UUID,
      allowNull: false,
    },
    originalFilename: {
      // Document file name as uploaded (non-unique, for user display).
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      // Document lifecycle/status (active=0, archived=1, deleted=2, locked=3).
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
    currentVersionId: {
      // The documentVersionId that is currently the primary/active version.
      type: DataTypes.UUID,
      allowNull: true,
    },
    retentionPolicy: {
      // Retention policy label or reference for compliance.
      type: DataTypes.STRING,
      allowNull: true,
    },
    encryptionType: {
      // Indicates applied encryption type ('none', 'system', 'external', etc).
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "system",
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
        fields: ["tenantId"],
      },

      {
        unique: true,
        fields: ["tenantId", "originalFilename"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = Document;
