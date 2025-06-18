const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetFileobjectCommand is exported from main code

describe("DbGetFileobjectCommand", () => {
  let DbGetFileobjectCommand, dbGetFileobject;
  let sandbox, FileObjectStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    FileObjectStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.fileObjectId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetFileobjectCommand, dbGetFileobject } = proxyquire(
      "../../../../src/db-layer/main/fileObject/dbGetFileobject",
      {
        models: { FileObject: FileObjectStub },
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
      const cmd = new DbGetFileobjectCommand({});
      expect(cmd.commandName).to.equal("dbGetFileobject");
      expect(cmd.objectName).to.equal("fileObject");
      expect(cmd.serviceLabel).to.equal("mhfz-documentcore-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call FileObject.getCqrsJoins if exists", async () => {
      const cmd = new DbGetFileobjectCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(FileObjectStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete FileObjectStub.getCqrsJoins;
      const cmd = new DbGetFileobjectCommand({});
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
      const cmd = new DbGetFileobjectCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetFileobjectCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetFileobject", () => {
    it("should execute dbGetFileobject and return fileObject data", async () => {
      const result = await dbGetFileobject({
        fileObjectId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
