const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfDocumentByField module", () => {
  let sandbox;
  let getIdListOfDocumentByField;
  let DocumentStub, hexaLogger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      tenantId: "example-type",
    };

    hexaLogger = {
      insertError: sandbox.stub(),
    };

    getIdListOfDocumentByField = proxyquire(
      "../../../../../src/db-layer/main/Document/utils/getIdListOfDocumentByField",
      {
        models: { Document: DocumentStub },
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

  describe("getIdListOfDocumentByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      DocumentStub["tenantId"] = "string";
      const result = await getIdListOfDocumentByField(
        "tenantId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(DocumentStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      DocumentStub["tenantId"] = "string";
      const result = await getIdListOfDocumentByField("tenantId", "val", true);
      const call = DocumentStub.findAll.getCall(0);
      expect(call.args[0].where["tenantId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfDocumentByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      DocumentStub["tenantId"] = 123; // expects number

      try {
        await getIdListOfDocumentByField("tenantId", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      DocumentStub.findAll.resolves([]);
      DocumentStub["tenantId"] = "string";

      try {
        await getIdListOfDocumentByField("tenantId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "Document with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      DocumentStub.findAll.rejects(new Error("query failed"));
      DocumentStub["tenantId"] = "string";

      try {
        await getIdListOfDocumentByField("tenantId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });

    it("should log error to hexaLogger if any error occurs", async () => {
      const error = new Error("boom");
      DocumentStub.findAll.rejects(error);
      DocumentStub["tenantId"] = "string";

      try {
        await getIdListOfDocumentByField("tenantId", "test", false);
      } catch (err) {
        sinon.assert.calledOnce(hexaLogger.insertError);
        sinon.assert.calledWithMatch(hexaLogger.insertError, "DatabaseError");
      }
    });
  });
});
