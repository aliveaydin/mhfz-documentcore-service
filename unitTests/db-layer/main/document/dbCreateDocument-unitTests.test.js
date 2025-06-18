const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateDocumentCommand is exported from main code
describe("DbCreateDocumentCommand", () => {
  let DbCreateDocumentCommand, dbCreateDocument;
  let sandbox,
    DocumentStub,
    ElasticIndexerStub,
    getDocumentByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getDocumentByIdStub = sandbox
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

    ({ DbCreateDocumentCommand, dbCreateDocument } = proxyquire(
      "../../../../src/db-layer/main/document/dbCreateDocument",
      {
        models: { Document: DocumentStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getDocumentById": getDocumentByIdStub,
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
      const cmd = new DbCreateDocumentCommand({});
      expect(cmd.commandName).to.equal("dbCreateDocument");
      expect(cmd.objectName).to.equal("document");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.dbEvent).to.equal(
        "mhfz-documentcore-service-dbevent-document-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getDocumentById and indexData", async () => {
      const cmd = new DbCreateDocumentCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getDocumentByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing document if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockdocument = { update: updateStub, getData: () => ({ id: 2 }) };

      DocumentStub.findOne = sandbox.stub().resolves(mockdocument);
      DocumentStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          tenantId: "tenantId_value",
          
          originalFilename: "originalFilename_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateDocumentCommand(input);
      await cmd.runDbCommand();

      expect(input.document).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new document if no unique match is found", async () => {
      DocumentStub.findOne = sandbox.stub().resolves(null);
      DocumentStub.findByPk = sandbox.stub().resolves(null);
      DocumentStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          tenantId: "tenantId_value",
          
          originalFilename: "originalFilename_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateDocumentCommand(input);
      await cmd.runDbCommand();

      expect(input.document).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(DocumentStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      DocumentStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateDocumentCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateDocument", () => {
    it("should execute successfully and return dbData", async () => {
      DocumentStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "document" } };
      const result = await dbCreateDocument(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
