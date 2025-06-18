const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getFileObjectById module", () => {
  let sandbox;
  let getFileObjectById;
  let FileObjectStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test FileObject" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
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

    getFileObjectById = proxyquire(
      "../../../../../src/db-layer/main/FileObject/utils/getFileObjectById",
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

  describe("getFileObjectById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getFileObjectById(fakeId);

      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(FileObjectStub.findByPk);
      sinon.assert.calledWith(FileObjectStub.findByPk, fakeId);
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getFileObjectById(["1", "2"]);

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(FileObjectStub.findAll);
      sinon.assert.calledWithMatch(FileObjectStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      FileObjectStub.findByPk.resolves(null);
      const result = await getFileObjectById(fakeId);

      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      FileObjectStub.findAll.resolves([]);
      const result = await getFileObjectById(["a", "b"]);

      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      FileObjectStub.findByPk.rejects(new Error("DB failure"));

      try {
        await getFileObjectById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      FileObjectStub.findAll.rejects(new Error("array failure"));

      try {
        await getFileObjectById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingFileObjectById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      FileObjectStub.findByPk.resolves({ getData: () => undefined });
      const result = await getFileObjectById(fakeId);

      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      FileObjectStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getFileObjectById(["1", "2"]);

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
