const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getFileObjectByQuery module", () => {
  let sandbox;
  let getFileObjectByQuery;
  let FileObjectStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test FileObject",
    getData: () => ({ id: fakeId, name: "Test FileObject" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getFileObjectByQuery = proxyquire(
      "../../../../../src/db-layer/main/FileObject/utils/getFileObjectByQuery",
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
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getFileObjectByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getFileObjectByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test FileObject" });
      sinon.assert.calledOnce(FileObjectStub.findOne);
      sinon.assert.calledWith(FileObjectStub.findOne, {
        where: { id: fakeId },
      });
    });

    it("should return null if no record is found", async () => {
      FileObjectStub.findOne.resolves(null);

      const result = await getFileObjectByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(FileObjectStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getFileObjectByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getFileObjectByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      FileObjectStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getFileObjectByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      FileObjectStub.findOne.resolves({ getData: () => undefined });

      const result = await getFileObjectByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
