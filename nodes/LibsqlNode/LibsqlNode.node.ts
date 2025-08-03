import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { createClient } from '@libsql/client';

export class LibsqlNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LibSQL Node',
		name: 'libsqlNode',
		icon: 'file:libsql-icon.svg',
		group: ['transform'],
		version: 1,
		description: 'A community node to interact with LibSQL databases',
		defaults: {
			name: 'LibSQL Node',
		},
		inputs: [NodeConnectionType.Main] as NodeConnectionType[],
		outputs: [NodeConnectionType.Main] as NodeConnectionType[],
		credentials: [
			{
				name: 'libsqlApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Query Type',
				name: 'query_type',
				type: 'options',
				default: 'SELECT',
				noDataExpression: true,
				required: true,
				options: [
					{
						name: 'CREATE',
						value: 'CREATE',
						description: 'Create a table',
					},
					{
						name: 'DELETE',
						value: 'DELETE',
						description: 'Delete rows from a table',
					},
					{
						name: 'INSERT',
						value: 'INSERT',
						description: 'Insert rows into a table',
					},
					{
						name: 'SELECT',
						value: 'SELECT',
						description: 'Select rows from a table (support for multiple queries)',
					},
					{
						name: 'UPDATE',
						value: 'UPDATE',
						description: 'Update rows in a table',
					},
				],
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'SELECT * FROM table where key = $key',
				description: 'The query to execute',
				required: true,
				typeOptions: {
					rows: 8,
				},
			},
		],
	};

	// The function below is responsible for executing LibSQL queries
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('libsqlApi');
		const { token, databaseUrl } = credentials;

		// Create LibSQL client
		const client = createClient({
			url: databaseUrl as string,
			authToken: token as string,
		});

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const queryType = this.getNodeParameter('query_type', itemIndex) as string;
				const query = this.getNodeParameter('query', itemIndex) as string;
				const item = items[itemIndex];

				if (!query.trim()) {
					throw new NodeOperationError(this.getNode(), 'Query cannot be empty', { itemIndex });
				}

				// Replace parameters in query with values from input item
				let processedQuery = query;
				const inputData = item.json;

				// Simple parameter replacement for $paramName format
				const paramRegex = /\$(\w+)/g;
				processedQuery = processedQuery.replace(paramRegex, (match, paramName) => {
					if (inputData[paramName] !== undefined) {
						const value = inputData[paramName];
						// Basic escaping for strings
						if (typeof value === 'string') {
							return `'${value.replace(/'/g, "''")}'`;
						}
						return String(value);
					}
					return match; // Keep original if no replacement found
				});

				let result: any;

				// Execute query based on type
				switch (queryType.toUpperCase()) {
					case 'SELECT':
						result = await client.execute(processedQuery);
						// For SELECT queries, return each row as a separate item
						if (result.rows && result.rows.length > 0) {
							for (const row of result.rows) {
								returnData.push({
									json: row as any,
									pairedItem: itemIndex,
								});
							}
						} else {
							// Return empty result if no rows
							returnData.push({
								json: { result: 'No rows found' },
								pairedItem: itemIndex,
							});
						}
						break;

					case 'INSERT':
					case 'UPDATE':
					case 'DELETE':
					case 'CREATE':
						result = await client.execute(processedQuery);
						returnData.push({
							json: {
								success: true,
								changes: result.changes || 0,
								lastInsertRowid: result.lastInsertRowid || null,
								query: processedQuery,
								queryType,
							},
							pairedItem: itemIndex,
						});
						break;

					default:
						// For any other query type, just execute and return the result
						result = await client.execute(processedQuery);
						returnData.push({
							json: {
								result,
								query: processedQuery,
								queryType,
							},
							pairedItem: itemIndex,
						});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		// Close the client connection
		client.close();

		return [returnData];
	}
}
