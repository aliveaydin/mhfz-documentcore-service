const { ServicePublisher } = require("serviceCommon");

// Document Event Publisher Classes

// Publisher class for createDocument route
const { DocumentCreatedTopic } = require("./topics");
class DocumentCreatedPublisher extends ServicePublisher {
  constructor(document, session, requestId) {
    super(DocumentCreatedTopic, document, session, requestId);
  }

  static async Publish(document, session, requestId) {
    const _publisher = new DocumentCreatedPublisher(
      document,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateDocument route
const { DocumentUpdatedTopic } = require("./topics");
class DocumentUpdatedPublisher extends ServicePublisher {
  constructor(document, session, requestId) {
    super(DocumentUpdatedTopic, document, session, requestId);
  }

  static async Publish(document, session, requestId) {
    const _publisher = new DocumentUpdatedPublisher(
      document,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteDocument route
const { DocumentDeletedTopic } = require("./topics");
class DocumentDeletedPublisher extends ServicePublisher {
  constructor(document, session, requestId) {
    super(DocumentDeletedTopic, document, session, requestId);
  }

  static async Publish(document, session, requestId) {
    const _publisher = new DocumentDeletedPublisher(
      document,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// DocumentVersion Event Publisher Classes

// Publisher class for createDocumentVersion route
const { DocumentversionCreatedTopic } = require("./topics");
class DocumentversionCreatedPublisher extends ServicePublisher {
  constructor(documentversion, session, requestId) {
    super(DocumentversionCreatedTopic, documentversion, session, requestId);
  }

  static async Publish(documentversion, session, requestId) {
    const _publisher = new DocumentversionCreatedPublisher(
      documentversion,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateDocumentVersion route
const { DocumentversionUpdatedTopic } = require("./topics");
class DocumentversionUpdatedPublisher extends ServicePublisher {
  constructor(documentversion, session, requestId) {
    super(DocumentversionUpdatedTopic, documentversion, session, requestId);
  }

  static async Publish(documentversion, session, requestId) {
    const _publisher = new DocumentversionUpdatedPublisher(
      documentversion,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteDocumentVersion route
const { DocumentversionDeletedTopic } = require("./topics");
class DocumentversionDeletedPublisher extends ServicePublisher {
  constructor(documentversion, session, requestId) {
    super(DocumentversionDeletedTopic, documentversion, session, requestId);
  }

  static async Publish(documentversion, session, requestId) {
    const _publisher = new DocumentversionDeletedPublisher(
      documentversion,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// FileObject Event Publisher Classes

// Publisher class for createFileObject route
const { FileobjectCreatedTopic } = require("./topics");
class FileobjectCreatedPublisher extends ServicePublisher {
  constructor(fileobject, session, requestId) {
    super(FileobjectCreatedTopic, fileobject, session, requestId);
  }

  static async Publish(fileobject, session, requestId) {
    const _publisher = new FileobjectCreatedPublisher(
      fileobject,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateFileObject route
const { FileobjectUpdatedTopic } = require("./topics");
class FileobjectUpdatedPublisher extends ServicePublisher {
  constructor(fileobject, session, requestId) {
    super(FileobjectUpdatedTopic, fileobject, session, requestId);
  }

  static async Publish(fileobject, session, requestId) {
    const _publisher = new FileobjectUpdatedPublisher(
      fileobject,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteFileObject route
const { FileobjectDeletedTopic } = require("./topics");
class FileobjectDeletedPublisher extends ServicePublisher {
  constructor(fileobject, session, requestId) {
    super(FileobjectDeletedTopic, fileobject, session, requestId);
  }

  static async Publish(fileobject, session, requestId) {
    const _publisher = new FileobjectDeletedPublisher(
      fileobject,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

module.exports = {
  DocumentCreatedPublisher,
  DocumentUpdatedPublisher,
  DocumentDeletedPublisher,
  DocumentversionCreatedPublisher,
  DocumentversionUpdatedPublisher,
  DocumentversionDeletedPublisher,
  FileobjectCreatedPublisher,
  FileobjectUpdatedPublisher,
  FileobjectDeletedPublisher,
};
