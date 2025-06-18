const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateDocumentversionCommand is exported from main code
describe("DbCreateDocumentversionCommand", () => {
  let DbCreateDocumentversionCommand, dbCreateDocumentversion;
  let sandbox,
    DocumentVersionStub,
    ElasticIndexerStub,
    getDocumentVersionByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getDocumentVersionByIdStub = sandbox
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

    ({ DbCreateDocumentversionCommand, dbCreateDocumentversion } = proxyquire(
      "../../../../src/db-layer/main/documentVersion/dbCreateDocumentversion",
      {
        models: { DocumentVersion: DocumentVersionStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getDocumentVersionById": getDocumentVersionByIdStub,
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
      const cmd = new DbCreateDocumentversionCommand({});
      expect(cmd.commandName).to.equal("dbCreateDocumentversion");
      expect(cmd.objectName).to.equal("documentVersion");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.dbEvent).to.equal(
        "mhfz-documentcore-service-dbevent-documentversion-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getDocumentVersionById and indexData", async () => {
      const cmd = new DbCreateDocumentversionCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getDocumentVersionByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing documentVersion if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockdocumentVersion = { update: updateStub, getData: () => ({ id: 2 }) };

      DocumentVersionStub.findOne = sandbox.stub().resolves(mockdocumentVersion);
      DocumentVersionStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          documentId: "documentId_value",
          
          versionNumber: "versionNumber_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateDocumentversionCommand(input);
      await cmd.runDbCommand();

      expect(input.documentVersion).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new documentVersion if no unique match is found", async () => {
      DocumentVersionStub.findOne = sandbox.stub().resolves(null);
      DocumentVersionStub.findByPk = sandbox.stub().resolves(null);
      DocumentVersionStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          documentId: "documentId_value",
          
          versionNumber: "versionNumber_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateDocumentversionCommand(input);
      await cmd.runDbCommand();

      expect(input.documentVersion).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(DocumentVersionStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      DocumentVersionStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateDocumentversionCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateDocumentversion", () => {
    it("should execute successfully and return dbData", async () => {
      DocumentVersionStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "documentVersion" } };
      const result = await dbCreateDocumentversion(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
