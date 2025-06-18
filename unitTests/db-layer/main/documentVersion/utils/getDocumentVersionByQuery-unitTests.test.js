const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getDocumentVersionByQuery module", () => {
  let sandbox;
  let getDocumentVersionByQuery;
  let DocumentVersionStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test DocumentVersion",
    getData: () => ({ id: fakeId, name: "Test DocumentVersion" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getDocumentVersionByQuery = proxyquire(
      "../../../../../src/db-layer/main/DocumentVersion/utils/getDocumentVersionByQuery",
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
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getDocumentVersionByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getDocumentVersionByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test DocumentVersion",
      });
      sinon.assert.calledOnce(DocumentVersionStub.findOne);
      sinon.assert.calledWith(DocumentVersionStub.findOne, {
        where: { id: fakeId },
      });
    });

    it("should return null if no record is found", async () => {
      DocumentVersionStub.findOne.resolves(null);

      const result = await getDocumentVersionByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(DocumentVersionStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getDocumentVersionByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getDocumentVersionByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      DocumentVersionStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getDocumentVersionByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingDocumentVersionByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      DocumentVersionStub.findOne.resolves({ getData: () => undefined });

      const result = await getDocumentVersionByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
