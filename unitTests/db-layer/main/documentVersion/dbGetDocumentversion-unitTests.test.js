const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetDocumentversionCommand is exported from main code

describe("DbGetDocumentversionCommand", () => {
  let DbGetDocumentversionCommand, dbGetDocumentversion;
  let sandbox, DocumentVersionStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    DocumentVersionStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.documentVersionId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetDocumentversionCommand, dbGetDocumentversion } = proxyquire(
      "../../../../src/db-layer/main/documentVersion/dbGetDocumentversion",
      {
        models: { DocumentVersion: DocumentVersionStub },
        dbCommand: {
          DBGetSequelizeCommand: BaseCommandStub,
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
    it("should set command metadata correctly", () => {
      const cmd = new DbGetDocumentversionCommand({});
      expect(cmd.commandName).to.equal("dbGetDocumentversion");
      expect(cmd.objectName).to.equal("documentVersion");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call DocumentVersion.getCqrsJoins if exists", async () => {
      const cmd = new DbGetDocumentversionCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(DocumentVersionStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete DocumentVersionStub.getCqrsJoins;
      const cmd = new DbGetDocumentversionCommand({});
      let errorThrown = false;
      try {
        await cmd.getCqrsJoins({});
      } catch (err) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.false;
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbGetDocumentversionCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetDocumentversionCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetDocumentversion", () => {
    it("should execute dbGetDocumentversion and return documentVersion data", async () => {
      const result = await dbGetDocumentversion({
        documentVersionId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
