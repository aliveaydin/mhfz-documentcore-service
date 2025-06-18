const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class DocumentVersionQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("documentVersion", [], Op.and, Op.eq, input, wClause);
  }
}
class DocumentVersionQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("documentVersion", []);
  }
}

module.exports = {
  DocumentVersionQueryCache,
  DocumentVersionQueryCacheInvalidator,
};
