const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateFileobjectCommand is exported from main code
describe("DbCreateFileobjectCommand", () => {
  let DbCreateFileobjectCommand, dbCreateFileobject;
  let sandbox,
    FileObjectStub,
    ElasticIndexerStub,
    getFileObjectByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getFileObjectByIdStub = sandbox
      .stub()
      .resolves({ id: 1, name: "Mock Client" });

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input) {
        this.input = input;
        this.dataClause = input.dataClause || {};
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = { id: 9 };
      }

      async runDbCommand() {}
      async execute() {
        return this.dbData;
      }
      loadHookFunctions() {}
      createEntityCacher() {}
      normalizeSequalizeOps(w) {
        return w;
      }
      createQueryCacheInvalidator() {}
    };

    ({ DbCreateFileobjectCommand, dbCreateFileobject } = proxyquire(
      "../../../../src/db-layer/main/fileObject/dbCreateFileobject",
      {
        models: { FileObject: FileObjectStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getFileObjectById": getFileObjectByIdStub,
        dbCommand: { DBCreateSequelizeCommand: BaseCommandStub },
        "./query-cache-classes": {
          ClientQueryCacheInvalidator: sandbox.stub(),
        },
        common: {
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
    it("should assign initial properties", () => {
      const cmd = new DbCreateFileobjectCommand({});
      expect(cmd.commandName).to.equal("dbCreateFileobject");
      expect(cmd.objectName).to.equal("fileObject");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.dbEvent).to.equal(
        "mhfz-documentcore-service-dbevent-fileobject-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getFileObjectById and indexData", async () => {
      const cmd = new DbCreateFileobjectCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getFileObjectByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing fileObject if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockfileObject = { update: updateStub, getData: () => ({ id: 2 }) };

      FileObjectStub.findOne = sandbox.stub().resolves(mockfileObject);
      FileObjectStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          tenantId: "tenantId_value",
          
          integrityHash: "integrityHash_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateFileobjectCommand(input);
      await cmd.runDbCommand();

      expect(input.fileObject).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new fileObject if no unique match is found", async () => {
      FileObjectStub.findOne = sandbox.stub().resolves(null);
      FileObjectStub.findByPk = sandbox.stub().resolves(null);
      FileObjectStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          tenantId: "tenantId_value",
          
          integrityHash: "integrityHash_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateFileobjectCommand(input);
      await cmd.runDbCommand();

      expect(input.fileObject).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(FileObjectStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      FileObjectStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateFileobjectCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateFileobject", () => {
    it("should execute successfully and return dbData", async () => {
      FileObjectStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "fileObject" } };
      const result = await dbCreateFileobject(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
