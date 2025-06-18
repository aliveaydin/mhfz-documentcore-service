const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetDocumentRestController also from file getdocument.js
describe("GetDocumentRestController", () => {
  let GetDocumentRestController, getDocument;
  let GetDocumentManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetDocumentManager constructor
    GetDocumentManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetDocumentRestController, getDocument } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/document/get-document.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetDocumentManager: GetDocumentManagerStub,
        },
        "../../RestController": class {
          constructor(name, routeName, _req, _res, _next) {
            this.name = name;
            this.routeName = routeName;
            this._req = _req;
            this._res = _res;
            this._next = _next;
            this.processRequest = processRequestStub;
          }
        },
      },
    ));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GetDocumentRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetDocumentRestController(req, res, next);

      expect(controller.name).to.equal("getDocument");
      expect(controller.routeName).to.equal("getdocument");
      expect(controller.dataName).to.equal("document");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetDocumentManager in createApiManager()", () => {
      const controller = new GetDocumentRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetDocumentManagerStub.calledOnceWithExactly(req, "rest")).to.be
        .true;
    });
  });

  describe("getDocument function", () => {
    it("should create instance and call processRequest", async () => {
      await getDocument(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
