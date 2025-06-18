const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "mhfz - documentCore",
    brand: {
      name: "mhfz",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "documentCore",
    },
    auth: {
      url: authUrl,
      loginPath: "/login",
      logoutPath: "/logout",
      currentUserPath: "/currentuser",
      authStrategy: "external",
      initialAuth: true,
    },
    dataObjects: [
      {
        name: "Document",
        description:
          "Represents a unique business document with base properties, status, current version pointer, access/owner, and retention attributes.",
        reference: {
          tableName: "document",
          properties: [
            {
              name: "tenantId",
              type: "ID",
            },

            {
              name: "ownerUserId",
              type: "ID",
            },

            {
              name: "originalFilename",
              type: "String",
            },

            {
              name: "status",
              type: "Enum",
            },

            {
              name: "currentVersionId",
              type: "ID",
            },

            {
              name: "retentionPolicy",
              type: "String",
            },

            {
              name: "encryptionType",
              type: "String",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/documents/{documentId}",
            title: "getDocument",
            query: [],

            parameters: [
              {
                key: "documentId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/documents",
            title: "createDocument",
            query: [],

            body: {
              type: "json",
              content: {
                originalFilename: "String",
                status: "Enum",
                currentVersionId: "ID",
                retentionPolicy: "String",
                encryptionType: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/documents/{documentId}",
            title: "updateDocument",
            query: [],

            body: {
              type: "json",
              content: {
                status: "Enum",
                currentVersionId: "ID",
                retentionPolicy: "String",
                encryptionType: "String",
              },
            },

            parameters: [
              {
                key: "documentId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/documents/{documentId}",
            title: "deleteDocument",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "documentId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/documents",
            title: "listDocuments",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "DocumentVersion",
        description:
          "Represents a single version of a document, tied to immutable file upload and uploader. Used for audit/versioning/restore.",
        reference: {
          tableName: "documentVersion",
          properties: [
            {
              name: "documentId",
              type: "ID",
            },

            {
              name: "versionNumber",
              type: "Integer",
            },

            {
              name: "uploaderUserId",
              type: "ID",
            },

            {
              name: "fileObjectId",
              type: "ID",
            },

            {
              name: "uploadDate",
              type: "Date",
            },

            {
              name: "comment",
              type: "String",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/documentversions/{documentVersionId}",
            title: "getDocumentVersion",
            query: [],

            parameters: [
              {
                key: "documentVersionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/documentversions",
            title: "createDocumentVersion",
            query: [],

            body: {
              type: "json",
              content: {
                documentId: "ID",
                versionNumber: "Integer",
                fileObjectId: "ID",
                uploadDate: "Date",
                comment: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/documentversions/{documentVersionId}",
            title: "updateDocumentVersion",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "documentVersionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/documentversions/{documentVersionId}",
            title: "deleteDocumentVersion",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "documentVersionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/documentversions",
            title: "listDocumentVersions",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "FileObject",
        description:
          "Stores file location and properties for uploaded or imported files (local/cloud/remote). Used by documentVersion.",
        reference: {
          tableName: "fileObject",
          properties: [
            {
              name: "tenantId",
              type: "ID",
            },

            {
              name: "integrityHash",
              type: "String",
            },

            {
              name: "sourceType",
              type: "Enum",
            },

            {
              name: "sourceId",
              type: "String",
            },

            {
              name: "sourceMeta",
              type: "Object",
            },

            {
              name: "fileSizeBytes",
              type: "Integer",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/fileobjects/{fileObjectId}",
            title: "getFileObject",
            query: [],

            parameters: [
              {
                key: "fileObjectId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/fileobjects",
            title: "createFileObject",
            query: [],

            body: {
              type: "json",
              content: {
                integrityHash: "String",
                sourceType: "Enum",
                sourceId: "String",
                sourceMeta: "Object",
                fileSizeBytes: "Integer",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/fileobjects/{fileObjectId}",
            title: "updateFileObject",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "fileObjectId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/fileobjects/{fileObjectId}",
            title: "deleteFileObject",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "fileObjectId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/fileobjects",
            title: "listFileObjects",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },
    ],
  };

  inject(app, config);
};
