# n8n-nodes-libsql

This is an n8n community node. It lets you interact with remote libSQL databases in your n8n workflows.

[libSQL](https://github.com/tursodatabase/libsql) is a fork of SQLite that is both Open Source, and Open Contributions. It has some other optimizations and allows for remote database connections via the `libsql` protocol.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following SQL operations:

- **SELECT**: Query data from tables. Returns each row as a separate item in the workflow output.
- **INSERT**: Insert new rows into tables. Returns operation metadata including the number of changes and last insert row ID.
- **UPDATE**: Update existing rows in tables. Returns operation metadata including the number of affected rows.
- **DELETE**: Delete rows from tables. Returns operation metadata including the number of deleted rows.
- **CREATE**: Create new tables or other database objects. Returns operation success status.

### Parameter Substitution

The node supports dynamic parameter substitution using the `$paramName` syntax in your SQL queries. Parameters are automatically replaced with values from the input item's JSON data.

**Example:**

```sql
SELECT * FROM users WHERE id = $userId AND name = $userName
```

If your input item contains `{"userId": 123, "userName": "John"}`, the query becomes:

```sql
SELECT * FROM users WHERE id = 123 AND name = 'John'
```

## Credentials

To use this node, you need to configure LibSQL API credentials with the following information:

### Prerequisites

- A LibSQL database (such as [Turso](https://turso.tech/) or a self-hosted libSQL server)
- Database URL in the format: `libsql://your-database-url`
- Authentication token for your database

### Setting up credentials

1. In n8n, go to **Settings** > **Credentials**
2. Click **Add Credential** and search for "LibSQL API"
3. Fill in the required fields:
   - **Database URL**: Your libSQL database URL (e.g., `libsql://your-database.domain.com`)
   - **Token**: Your database authentication token

## Compatibility

- **Minimum n8n version**: 0.198.0
- **Tested with n8n versions**: 1.0.0+
- **Node.js version**: >=20.15 (as specified in package.json)

### Known limitations

- Parameter substitution uses simple string replacement - for complex queries, consider using prepared statements through the libSQL client directly
- Connection pooling is not implemented - each execution creates a new connection
- Large result sets are returned as individual items, which may impact performance for very large queries

<!-- ## Usage

_This is an optional section. Use it to help users with any difficult or confusing aspects of the node._

_By the time users are looking for community nodes, they probably already know n8n basics. But if you expect new users, you can link to the [Try it out](https://docs.n8n.io/try-it-out/) documentation to help them get started._ -->

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [libSQL](https://github.com/tursodatabase/libsql)

<!-- ## Version history

_This is another optional section. If your node has multiple versions, include a short description of available versions and what changed, as well as any compatibility impact._ -->

## Contributing

Feel free to open a pull request with a feature you'd like in the node. Opening an issue is fine but I can't guarantee active development on the node, I created this for my own use mostly.
