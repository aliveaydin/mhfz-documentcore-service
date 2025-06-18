const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("updateFileObjectByIdList module", () => {
  let sandbox;
  let updateFileObjectByIdList;
  let FileObjectStub;

  const fakeIdList = ["id1", "id2"];
  const fakeUpdatedRows = [
    { id: "id1", name: "Updated 1" },
    { id: "id2", name: "Updated 2" },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      update: sandbox.stub().resolves([2, fakeUpdatedRows]),
    };

    updateFileObjectByIdList = proxyquire(
      "../../../../../src/db-layer/main/FileObject/utils/updateFileObjectByIdList",
      {
        models: { FileObject: FileObjectStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(message, details) {
              super(message);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          hexaLogger: { insertError: sandbox.stub() },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("updateFileObjectByIdList", () => {
    it("should return list of updated IDs if update is successful", async () => {
      const result = await updateFileObjectByIdList(fakeIdList, {
        name: "Updated",
      });

      expect(result).to.deep.equal(["id1", "id2"]);
      sinon.assert.calledOnce(FileObjectStub.update);
      const args = FileObjectStub.update.getCall(0).args;
      expect(args[0]).to.deep.equal({ name: "Updated" });
      expect(args[1]).to.deep.equal({
        where: { id: { [Op.in]: fakeIdList }, isActive: true },
        returning: true,
      });
    });

    it("should return empty list if update returns no rows", async () => {
      FileObjectStub.update.resolves([0, []]);

      const result = await updateFileObjectByIdList(["id99"], {
        status: "inactive",
      });

      expect(result).to.deep.equal([]);
    });

    it("should return list with one id if only one record updated", async () => {
      FileObjectStub.update.resolves([1, [{ id: "id1" }]]);

      const result = await updateFileObjectByIdList(["id1"], { active: false });

      expect(result).to.deep.equal(["id1"]);
    });

    it("should throw HttpServerError if model update fails", async () => {
      FileObjectStub.update.rejects(new Error("update failed"));

      try {
        await updateFileObjectByIdList(["id1"], { name: "err" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenUpdatingFileObjectByIdList",
        );
        expect(err.details.message).to.equal("update failed");
      }
    });

    it("should call update with empty dataClause", async () => {
      await updateFileObjectByIdList(["id1"], {});
      sinon.assert.calledOnce(FileObjectStub.update);
    });
  });
});
