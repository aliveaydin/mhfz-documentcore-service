const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getFileObjectByIntegrityHash module", () => {
  let sandbox;
  let getFileObjectByIntegrityHash;
  let FileObjectStub;

  const mockData = { id: "123", name: "Test FileObject" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getFileObjectByIntegrityHash = proxyquire(
      "../../../../../src/db-layer/main/FileObject/utils/getFileObjectByIntegrityHash",
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
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getFileObjectByIntegrityHash", () => {
    it("should return getData() if fileObject is found", async () => {
      const result = await getFileObjectByIntegrityHash("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(FileObjectStub.findOne);
      sinon.assert.calledWithMatch(FileObjectStub.findOne, {
        where: { integrityHash: "some-key" },
      });
    });

    it("should return null if fileObject is not found", async () => {
      FileObjectStub.findOne.resolves(null);
      const result = await getFileObjectByIntegrityHash("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      FileObjectStub.findOne.resolves({ getData: () => undefined });
      const result = await getFileObjectByIntegrityHash("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      FileObjectStub.findOne.rejects(new Error("db failure"));

      try {
        await getFileObjectByIntegrityHash("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectByIntegrityHash",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
