const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getDocumentByQuery module", () => {
  let sandbox;
  let getDocumentByQuery;
  let DocumentStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test Document",
    getData: () => ({ id: fakeId, name: "Test Document" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getDocumentByQuery = proxyquire(
      "../../../../../src/db-layer/main/Document/utils/getDocumentByQuery",
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
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getDocumentByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getDocumentByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test Document" });
      sinon.assert.calledOnce(DocumentStub.findOne);
      sinon.assert.calledWith(DocumentStub.findOne, { where: { id: fakeId } });
    });

    it("should return null if no record is found", async () => {
      DocumentStub.findOne.resolves(null);

      const result = await getDocumentByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(DocumentStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getDocumentByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getDocumentByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      DocumentStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getDocumentByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      DocumentStub.findOne.resolves({ getData: () => undefined });

      const result = await getDocumentByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
