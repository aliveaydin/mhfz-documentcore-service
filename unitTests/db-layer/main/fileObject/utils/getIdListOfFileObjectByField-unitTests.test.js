const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfFileObjectByField module", () => {
  let sandbox;
  let getIdListOfFileObjectByField;
  let FileObjectStub, hexaLogger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      tenantId: "example-type",
    };

    hexaLogger = {
      insertError: sandbox.stub(),
    };

    getIdListOfFileObjectByField = proxyquire(
      "../../../../../src/db-layer/main/FileObject/utils/getIdListOfFileObjectByField",
      {
        models: { FileObject: FileObjectStub },
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

  describe("getIdListOfFileObjectByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      FileObjectStub["tenantId"] = "string";
      const result = await getIdListOfFileObjectByField(
        "tenantId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(FileObjectStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      FileObjectStub["tenantId"] = "string";
      const result = await getIdListOfFileObjectByField(
        "tenantId",
        "val",
        true,
      );
      const call = FileObjectStub.findAll.getCall(0);
      expect(call.args[0].where["tenantId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfFileObjectByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      FileObjectStub["tenantId"] = 123; // expects number

      try {
        await getIdListOfFileObjectByField("tenantId", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      FileObjectStub.findAll.resolves([]);
      FileObjectStub["tenantId"] = "string";

      try {
        await getIdListOfFileObjectByField("tenantId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "FileObject with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      FileObjectStub.findAll.rejects(new Error("query failed"));
      FileObjectStub["tenantId"] = "string";

      try {
        await getIdListOfFileObjectByField("tenantId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });

    it("should log error to hexaLogger if any error occurs", async () => {
      const error = new Error("boom");
      FileObjectStub.findAll.rejects(error);
      FileObjectStub["tenantId"] = "string";

      try {
        await getIdListOfFileObjectByField("tenantId", "test", false);
      } catch (err) {
        sinon.assert.calledOnce(hexaLogger.insertError);
        sinon.assert.calledWithMatch(hexaLogger.insertError, "DatabaseError");
      }
    });
  });
});
