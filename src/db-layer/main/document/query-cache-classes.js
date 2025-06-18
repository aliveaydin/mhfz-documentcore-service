const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class DocumentQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("document", [], Op.and, Op.eq, input, wClause);
  }
}
class DocumentQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("document", []);
  }
}

module.exports = {
  DocumentQueryCache,
  DocumentQueryCacheInvalidator,
};
