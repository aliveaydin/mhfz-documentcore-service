# Service Design Specification - Object Design for documentVersion

**mhfz-documentcore-service** documentation

## Document Overview

This document outlines the object design for the `documentVersion` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## documentVersion Data Object

### Object Overview

**Description:** Represents a single version of a document, tied to immutable file upload and uploader. Used for audit/versioning/restore.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.

### Composite Indexes

- **docVerByDocAndVersion**: [documentId, versionNumber]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `throwError`

An error will be thrown, preventing the insertion of conflicting data.

### Properties Schema

| Property         | Type    | Required | Description                                                              |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------ |
| `documentId`     | ID      | Yes      | Parent business document id for this version.                            |
| `versionNumber`  | Integer | Yes      | The version index (1 = first/original, increments with each upload).     |
| `uploaderUserId` | ID      | Yes      | ID of the user who uploaded this version.                                |
| `fileObjectId`   | ID      | Yes      | ID of the file object associated with this version&#39;s physical asset. |
| `uploadDate`     | Date    | Yes      | Timestamp when this version was uploaded.                                |
| `comment`        | String  | No       | Optional version comment/note.                                           |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **versionNumber**: 1

### Constant Properties

`documentId` `versionNumber` `uploaderUserId` `fileObjectId` `uploadDate` `comment`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Elastic Search Indexing

`documentId` `versionNumber` `uploadDate`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`documentId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Relation Properties

`documentId` `uploaderUserId` `fileObjectId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **documentId**: ID
  Relation to `document`.id

The target object is a parent object, meaning that the relation is a one-to-many relationship from target to this object.

On Delete: Set Null
Required: Yes

- **uploaderUserId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: Yes

- **fileObjectId**: ID
  Relation to `fileObject`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: Yes

### Session Data Properties

`uploaderUserId`

Session data properties are used to store data that is specific to the user session, allowing for personalized experiences and temporary data storage.
If a property is configured as session data, it will be automatically mapped to the related field in the user session during CRUD operations.
Note that session data properties can not be mutated by the user, but only by the system.

- **uploaderUserId**: ID property will be mapped to the session parameter `userId`.

This property is also used to store the owner of the session data, allowing for ownership checks and access control.

### Filter Properties

`documentId` `versionNumber` `uploadDate`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **documentId**: ID has a filter named `documentId`

- **versionNumber**: Integer has a filter named `versionNumber`

- **uploadDate**: Date has a filter named `uploadDate`
