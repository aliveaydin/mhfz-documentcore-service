const express = require("express");

// Document Db Object Rest Api Router
const documentRouter = express.Router();

// add Document controllers

// getDocument controller
documentRouter.get("/documents/:documentId", require("./get-document"));
// createDocument controller
documentRouter.post("/documents", require("./create-document"));
// updateDocument controller
documentRouter.patch("/documents/:documentId", require("./update-document"));
// deleteDocument controller
documentRouter.delete("/documents/:documentId", require("./delete-document"));
// listDocuments controller
documentRouter.get("/documents", require("./list-documents"));

module.exports = documentRouter;
