const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfDocumentVersionByField module", () => {
  let sandbox;
  let getIdListOfDocumentVersionByField;
  let DocumentVersionStub, hexaLogger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      documentId: "example-type",
    };

    hexaLogger = {
      insertError: sandbox.stub(),
    };

    getIdListOfDocumentVersionByField = proxyquire(
      "../../../../../src/db-layer/main/DocumentVersion/utils/getIdListOfDocumentVersionByField",
      {
        models: { DocumentVersion: DocumentVersionStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
          hexaLogger,
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getIdListOfDocumentVersionByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      DocumentVersionStub["documentId"] = "string";
      const result = await getIdListOfDocumentVersionByField(
        "documentId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(DocumentVersionStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      DocumentVersionStub["documentId"] = "string";
      const result = await getIdListOfDocumentVersionByField(
        "documentId",
        "val",
        true,
      );
      const call = DocumentVersionStub.findAll.getCall(0);
      expect(call.args[0].where["documentId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfDocumentVersionByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      DocumentVersionStub["documentId"] = 123; // expects number

      try {
        await getIdListOfDocumentVersionByField(
          "documentId",
          "wrong-type",
          false,
        );
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      DocumentVersionStub.findAll.resolves([]);
      DocumentVersionStub["documentId"] = "string";

      try {
        await getIdListOfDocumentVersionByField("documentId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "DocumentVersion with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      DocumentVersionStub.findAll.rejects(new Error("query failed"));
      DocumentVersionStub["documentId"] = "string";

      try {
        await getIdListOfDocumentVersionByField("documentId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });

    it("should log error to hexaLogger if any error occurs", async () => {
      const error = new Error("boom");
      DocumentVersionStub.findAll.rejects(error);
      DocumentVersionStub["documentId"] = "string";

      try {
        await getIdListOfDocumentVersionByField("documentId", "test", false);
      } catch (err) {
        sinon.assert.calledOnce(hexaLogger.insertError);
        sinon.assert.calledWithMatch(hexaLogger.insertError, "DatabaseError");
      }
    });
  });
});
