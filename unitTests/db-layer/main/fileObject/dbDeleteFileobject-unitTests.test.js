const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteFileobjectCommand is exported from main code

describe("DbDeleteFileobjectCommand", () => {
  let DbDeleteFileobjectCommand, dbDeleteFileobject;
  let sandbox,
    FileObjectStub,
    getFileObjectByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {};

    getFileObjectByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.fileObjectId || 123 };
        this.dbInstance = null;
      }

      loadHookFunctions() {}
      initOwnership() {}
      async execute() {
        await this.createQueryCacheInvalidator?.();
        await this.createDbInstance?.();
        await this.indexDataToElastic?.();
        return this.dbData;
      }
    };

    ({ DbDeleteFileobjectCommand, dbDeleteFileobject } = proxyquire(
      "../../../../src/db-layer/main/fileObject/dbDeleteFileobject",
      {
        models: { FileObject: FileObjectStub },
        "./query-cache-classes": {
          FileObjectQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getFileObjectById": getFileObjectByIdStub,
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        dbCommand: {
          DBSoftDeleteSequelizeCommand: BaseCommandStub,
        },
        common: {
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
          HttpServerError: class extends Error {
            constructor(msg, details) {
              super(msg);
              this.details = details;
            }
          },
        },
      },
    ));
  });

  afterEach(() => sandbox.restore());

  describe("constructor", () => {
    it("should set command metadata correctly", () => {
      const cmd = new DbDeleteFileobjectCommand({});
      expect(cmd.commandName).to.equal("dbDeleteFileobject");
      expect(cmd.objectName).to.equal("fileObject");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.dbEvent).to.equal(
        "mhfz-documentcore-service-dbevent-fileobject-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteFileobjectCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteFileobject", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getFileObjectByIdStub.resolves(mockInstance);

      const input = {
        fileObjectId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteFileobject(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
