const express = require("express");

// DocumentVersion Db Object Rest Api Router
const documentVersionRouter = express.Router();

// add DocumentVersion controllers

// getDocumentVersion controller
documentVersionRouter.get(
  "/documentversions/:documentVersionId",
  require("./get-documentversion"),
);
// createDocumentVersion controller
documentVersionRouter.post(
  "/documentversions",
  require("./create-documentversion"),
);
// updateDocumentVersion controller
documentVersionRouter.patch(
  "/documentversions/:documentVersionId",
  require("./update-documentversion"),
);
// deleteDocumentVersion controller
documentVersionRouter.delete(
  "/documentversions/:documentVersionId",
  require("./delete-documentversion"),
);
// listDocumentVersions controller
documentVersionRouter.get(
  "/documentversions",
  require("./list-documentversions"),
);

module.exports = documentVersionRouter;
