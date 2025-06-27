const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getDocumentAggById module", () => {
  let sandbox;
  let getDocumentAggById;
  let DocumentStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test Document" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentStub = {
      findByPk: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getDocumentAggById = proxyquire(
      "../../../../../src/db-layer/main/Document/utils/getDocumentAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getDocumentAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getDocumentAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(DocumentStub.findByPk);
      sinon.assert.calledOnce(DocumentStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getDocumentAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(DocumentStub.findAll);
      sinon.assert.calledOnce(DocumentStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      DocumentStub.findByPk.resolves(null);
      const result = await getDocumentAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      DocumentStub.findAll.resolves([]);
      const result = await getDocumentAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      DocumentStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getDocumentAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      DocumentStub.findByPk.resolves({ getData: () => undefined });
      const result = await getDocumentAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findByPk)", async () => {
      DocumentStub.findByPk.rejects(new Error("fail"));
      try {
        await getDocumentAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      DocumentStub.findAll.rejects(new Error("all fail"));
      try {
        await getDocumentAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      DocumentStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getDocumentAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
