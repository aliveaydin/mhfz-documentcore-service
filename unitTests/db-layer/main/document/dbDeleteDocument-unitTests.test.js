const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteDocumentCommand is exported from main code

describe("DbDeleteDocumentCommand", () => {
  let DbDeleteDocumentCommand, dbDeleteDocument;
  let sandbox,
    DocumentStub,
    getDocumentByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentStub = {};

    getDocumentByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.documentId || 123 };
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

    ({ DbDeleteDocumentCommand, dbDeleteDocument } = proxyquire(
      "../../../../src/db-layer/main/document/dbDeleteDocument",
      {
        models: { Document: DocumentStub },
        "./query-cache-classes": {
          DocumentQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getDocumentById": getDocumentByIdStub,
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
      const cmd = new DbDeleteDocumentCommand({});
      expect(cmd.commandName).to.equal("dbDeleteDocument");
      expect(cmd.objectName).to.equal("document");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.dbEvent).to.equal(
        "mhfz-documentcore-service-dbevent-document-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteDocumentCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteDocument", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getDocumentByIdStub.resolves(mockInstance);

      const input = {
        documentId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteDocument(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
