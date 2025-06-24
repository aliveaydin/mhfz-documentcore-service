# Service Design Specification - Object Design for fileObject

**mhfz-documentcore-service** documentation

## Document Overview

This document outlines the object design for the `fileObject` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## fileObject Data Object

### Object Overview

**Description:** Stores file location and properties for uploaded or imported files (local/cloud/remote). Used by documentVersion.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.

### Composite Indexes

- **fileHashPerTenant**: [tenantId, integrityHash]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `throwError`

An error will be thrown, preventing the insertion of conflicting data.

### Properties Schema

| Property        | Type    | Required | Description                                                                       |
| --------------- | ------- | -------- | --------------------------------------------------------------------------------- |
| `tenantId`      | ID      | Yes      | Tenant/organization owning the file (for dedupe/policy).                          |
| `integrityHash` | String  | Yes      | SHA256 file hash for virus/deduplication/integrity.                               |
| `sourceType`    | Enum    | Yes      | Where the file came from: local=0, googleDrive=1, office365=2, oneDrive=3, url=4. |
| `sourceId`      | String  | No       | Source system file id in case of cloud (leave blank for local).                   |
| `sourceMeta`    | Object  | No       | Cloud-specific file metadata (JSON); empty for local uploads.                     |
| `fileSizeBytes` | Integer | Yes      | Size of file in bytes.                                                            |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Constant Properties

`tenantId` `integrityHash` `sourceType` `sourceId` `sourceMeta` `fileSizeBytes`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **sourceType**: [local, googleDrive, office365, oneDrive, url]

### Elastic Search Indexing

`tenantId` `sourceType`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`tenantId` `integrityHash`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Secondary Key Properties

`integrityHash`

Secondary key properties are used to create an additional indexed identifiers for the data object, allowing for alternative access patterns.
Different than normal indexed properties, secondary keys will act as primary keys and Mindbricks will provide automatic secondary key db utility functions to access the data object by the secondary key.

### Session Data Properties

`tenantId`

Session data properties are used to store data that is specific to the user session, allowing for personalized experiences and temporary data storage.
If a property is configured as session data, it will be automatically mapped to the related field in the user session during CRUD operations.
Note that session data properties can not be mutated by the user, but only by the system.

- **tenantId**: ID property will be mapped to the session parameter `tenantId`.

### Filter Properties

`tenantId` `integrityHash` `sourceType`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **tenantId**: ID has a filter named `tenantId`

- **integrityHash**: String has a filter named `integrityHash`

- **sourceType**: Enum has a filter named `sourceType`
