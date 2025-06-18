const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Stores file location and properties for uploaded or imported files (local/cloud/remote). Used by documentVersion.
const FileObject = sequelize.define(
  "fileObject",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    tenantId: {
      // Tenant/organization owning the file (for dedupe/policy).
      type: DataTypes.UUID,
      allowNull: false,
    },
    integrityHash: {
      // SHA256 file hash for virus/deduplication/integrity.
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceType: {
      // Where the file came from: local=0, googleDrive=1, office365=2, oneDrive=3, url=4.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "local",
    },
    sourceId: {
      // Source system file id in case of cloud (leave blank for local).
      type: DataTypes.STRING,
      allowNull: true,
    },
    sourceMeta: {
      // Cloud-specific file metadata (JSON); empty for local uploads.
      type: DataTypes.JSONB,
      allowNull: true,
    },
    fileSizeBytes: {
      // Size of file in bytes.
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
        unique: false,
        fields: ["integrityHash"],
      },

      {
        unique: true,
        fields: ["tenantId", "integrityHash"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = FileObject;
