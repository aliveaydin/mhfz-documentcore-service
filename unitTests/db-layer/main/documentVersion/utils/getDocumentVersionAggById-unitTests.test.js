const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getDocumentVersionAggById module", () => {
  let sandbox;
  let getDocumentVersionAggById;
  let DocumentVersionStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test DocumentVersion" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {
      findByPk: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getDocumentVersionAggById = proxyquire(
      "../../../../../src/db-layer/main/DocumentVersion/utils/getDocumentVersionAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getDocumentVersionAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getDocumentVersionAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(DocumentVersionStub.findByPk);
      sinon.assert.calledOnce(DocumentVersionStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getDocumentVersionAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(DocumentVersionStub.findAll);
      sinon.assert.calledOnce(DocumentVersionStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      DocumentVersionStub.findByPk.resolves(null);
      const result = await getDocumentVersionAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      DocumentVersionStub.findAll.resolves([]);
      const result = await getDocumentVersionAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      DocumentVersionStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getDocumentVersionAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      DocumentVersionStub.findByPk.resolves({ getData: () => undefined });
      const result = await getDocumentVersionAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findByPk)", async () => {
      DocumentVersionStub.findByPk.rejects(new Error("fail"));
      try {
        await getDocumentVersionAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentVersionAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      DocumentVersionStub.findAll.rejects(new Error("all fail"));
      try {
        await getDocumentVersionAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentVersionAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      DocumentVersionStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getDocumentVersionAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentVersionAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
