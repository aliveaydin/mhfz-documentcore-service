const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class FileObjectQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("fileObject", [], Op.and, Op.eq, input, wClause);
  }
}
class FileObjectQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("fileObject", []);
  }
}

module.exports = {
  FileObjectQueryCache,
  FileObjectQueryCacheInvalidator,
};
