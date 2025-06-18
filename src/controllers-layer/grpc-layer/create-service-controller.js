const DocumentCoreServiceGrpcController = require("./DocumentCoreServiceGrpcController");

module.exports = (name, routeName, call, callback) => {
  const grpcController = new DocumentCoreServiceGrpcController(
    name,
    routeName,
    call,
    callback,
  );
  return grpcController;
};
