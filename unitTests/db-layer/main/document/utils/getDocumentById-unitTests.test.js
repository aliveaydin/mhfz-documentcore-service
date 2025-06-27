const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getDocumentById module", () => {
  let sandbox;
  let getDocumentById;
  let DocumentStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test Document" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentStub = {
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

    getDocumentById = proxyquire(
      "../../../../../src/db-layer/main/Document/utils/getDocumentById",
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

  describe("getDocumentById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getDocumentById(fakeId);

      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(DocumentStub.findByPk);
      sinon.assert.calledWith(DocumentStub.findByPk, fakeId);
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getDocumentById(["1", "2"]);

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(DocumentStub.findAll);
      sinon.assert.calledWithMatch(DocumentStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      DocumentStub.findByPk.resolves(null);
      const result = await getDocumentById(fakeId);

      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      DocumentStub.findAll.resolves([]);
      const result = await getDocumentById(["a", "b"]);

      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      DocumentStub.findByPk.rejects(new Error("DB failure"));

      try {
        await getDocumentById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      DocumentStub.findAll.rejects(new Error("array failure"));

      try {
        await getDocumentById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      DocumentStub.findByPk.resolves({ getData: () => undefined });
      const result = await getDocumentById(fakeId);

      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      DocumentStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getDocumentById(["1", "2"]);

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
