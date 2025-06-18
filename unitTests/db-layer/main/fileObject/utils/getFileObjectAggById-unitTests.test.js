const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getFileObjectAggById module", () => {
  let sandbox;
  let getFileObjectAggById;
  let FileObjectStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test FileObject" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      findByPk: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getFileObjectAggById = proxyquire(
      "../../../../../src/db-layer/main/FileObject/utils/getFileObjectAggById",
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
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getFileObjectAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getFileObjectAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(FileObjectStub.findByPk);
      sinon.assert.calledOnce(FileObjectStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getFileObjectAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(FileObjectStub.findAll);
      sinon.assert.calledOnce(FileObjectStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      FileObjectStub.findByPk.resolves(null);
      const result = await getFileObjectAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      FileObjectStub.findAll.resolves([]);
      const result = await getFileObjectAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      FileObjectStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getFileObjectAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      FileObjectStub.findByPk.resolves({ getData: () => undefined });
      const result = await getFileObjectAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findByPk)", async () => {
      FileObjectStub.findByPk.rejects(new Error("fail"));
      try {
        await getFileObjectAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      FileObjectStub.findAll.rejects(new Error("all fail"));
      try {
        await getFileObjectAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      FileObjectStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getFileObjectAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
