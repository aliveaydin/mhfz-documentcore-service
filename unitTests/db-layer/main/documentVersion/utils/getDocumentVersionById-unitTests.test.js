const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getDocumentVersionById module", () => {
  let sandbox;
  let getDocumentVersionById;
  let DocumentVersionStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test DocumentVersion" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {
      findByPk: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getDocumentVersionById = proxyquire(
      "../../../../../src/db-layer/main/DocumentVersion/utils/getDocumentVersionById",
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

  describe("getDocumentVersionById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getDocumentVersionById(fakeId);

      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(DocumentVersionStub.findByPk);
      sinon.assert.calledWith(DocumentVersionStub.findByPk, fakeId);
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getDocumentVersionById(["1", "2"]);

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(DocumentVersionStub.findAll);
      sinon.assert.calledWithMatch(DocumentVersionStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      DocumentVersionStub.findByPk.resolves(null);
      const result = await getDocumentVersionById(fakeId);

      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      DocumentVersionStub.findAll.resolves([]);
      const result = await getDocumentVersionById(["a", "b"]);

      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      DocumentVersionStub.findByPk.rejects(new Error("DB failure"));

      try {
        await getDocumentVersionById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentVersionById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      DocumentVersionStub.findAll.rejects(new Error("array failure"));

      try {
        await getDocumentVersionById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentVersionById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      DocumentVersionStub.findByPk.resolves({ getData: () => undefined });
      const result = await getDocumentVersionById(fakeId);

      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      DocumentVersionStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getDocumentVersionById(["1", "2"]);

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
