const express = require("express");

// FileObject Db Object Rest Api Router
const fileObjectRouter = express.Router();

// add FileObject controllers

// getFileObject controller
fileObjectRouter.get("/fileobjects/:fileObjectId", require("./get-fileobject"));
// createFileObject controller
fileObjectRouter.post("/fileobjects", require("./create-fileobject"));
// updateFileObject controller
fileObjectRouter.patch(
  "/fileobjects/:fileObjectId",
  require("./update-fileobject"),
);
// deleteFileObject controller
fileObjectRouter.delete(
  "/fileobjects/:fileObjectId",
  require("./delete-fileobject"),
);
// listFileObjects controller
fileObjectRouter.get("/fileobjects", require("./list-fileobjects"));

module.exports = fileObjectRouter;
