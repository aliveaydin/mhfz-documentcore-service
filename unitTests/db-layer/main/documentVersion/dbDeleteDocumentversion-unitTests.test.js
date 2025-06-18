const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteDocumentversionCommand is exported from main code

describe("DbDeleteDocumentversionCommand", () => {
  let DbDeleteDocumentversionCommand, dbDeleteDocumentversion;
  let sandbox,
    DocumentVersionStub,
    getDocumentVersionByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {};

    getDocumentVersionByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.documentVersionId || 123 };
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

    ({ DbDeleteDocumentversionCommand, dbDeleteDocumentversion } = proxyquire(
      "../../../../src/db-layer/main/documentVersion/dbDeleteDocumentversion",
      {
        models: { DocumentVersion: DocumentVersionStub },
        "./query-cache-classes": {
          DocumentVersionQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getDocumentVersionById": getDocumentVersionByIdStub,
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
      const cmd = new DbDeleteDocumentversionCommand({});
      expect(cmd.commandName).to.equal("dbDeleteDocumentversion");
      expect(cmd.objectName).to.equal("documentVersion");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.dbEvent).to.equal(
        "mhfz-documentcore-service-dbevent-documentversion-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteDocumentversionCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteDocumentversion", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getDocumentVersionByIdStub.resolves(mockInstance);

      const input = {
        documentVersionId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteDocumentversion(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
