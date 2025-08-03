import {
	// IAuthenticateGeneric,
	// ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LibsqlApi implements ICredentialType {
	name = 'libsqlApi';
	displayName = 'LibSQL API';
	documentationUrl = 'https://your-docs-url';
	properties: INodeProperties[] = [
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'Database URL',
			name: 'databaseUrl',
			type: 'string',
			default: 'libsql://',
		},
	];
}
