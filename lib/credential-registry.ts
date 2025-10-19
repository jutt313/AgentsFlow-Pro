/**
 * Credential Registry
 * Defines exact credential fields and scopes for popular integrations
 */

export interface CredentialField {
  name: string;
  type: 'text' | 'password' | 'email' | 'url' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  description?: string;
}

export interface CredentialSpec {
  platform: string;
  displayName: string;
  authType: 'oauth' | 'api-key' | 'basic' | 'token';
  fields: CredentialField[];
  scopes: string[];
  docsUrl?: string;
  setupInstructions?: string;
}

/**
 * Registry of credential specifications for major platforms
 */
export const CREDENTIAL_REGISTRY: Record<string, CredentialSpec> = {
  // Email Services
  gmail: {
    platform: 'gmail',
    displayName: 'Gmail',
    authType: 'oauth',
    fields: [
      {
        name: 'client_id',
        type: 'text',
        label: 'Client ID',
        placeholder: 'xxxxxxxxxxxx-xxxxxxxxxxxxx.apps.googleusercontent.com',
        required: true,
        description: 'OAuth 2.0 Client ID from Google Cloud Console'
      },
      {
        name: 'client_secret',
        type: 'password',
        label: 'Client Secret',
        placeholder: 'GOCSPX-xxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'OAuth 2.0 Client Secret'
      },
      {
        name: 'refresh_token',
        type: 'password',
        label: 'Refresh Token',
        placeholder: '1//xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'OAuth Refresh Token for long-term access'
      }
    ],
    scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    docsUrl: 'https://developers.google.com/gmail/api/guides',
    setupInstructions: '1. Go to Google Cloud Console\n2. Create OAuth 2.0 credentials\n3. Authorize and get refresh token'
  },

  sendgrid: {
    platform: 'sendgrid',
    displayName: 'SendGrid',
    authType: 'api-key',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        placeholder: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'SendGrid API Key with mail.send permission'
      },
      {
        name: 'from_email',
        type: 'email',
        label: 'From Email',
        placeholder: 'noreply@yourdomain.com',
        required: true,
        description: 'Verified sender email address'
      },
      {
        name: 'from_name',
        type: 'text',
        label: 'From Name',
        placeholder: 'Your Company',
        required: false,
        description: 'Display name for sender'
      }
    ],
    scopes: ['mail.send'],
    docsUrl: 'https://docs.sendgrid.com/api-reference/api-keys/create-api-keys',
    setupInstructions: '1. Go to SendGrid Dashboard\n2. Settings > API Keys\n3. Create API Key with Mail Send permission'
  },

  // E-commerce
  shopify: {
    platform: 'shopify',
    displayName: 'Shopify',
    authType: 'token',
    fields: [
      {
        name: 'shop_name',
        type: 'text',
        label: 'Shop Name',
        placeholder: 'your-store',
        required: true,
        description: 'Your Shopify store name (from your-store.myshopify.com)'
      },
      {
        name: 'access_token',
        type: 'password',
        label: 'Access Token',
        placeholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'Shopify Admin API Access Token'
      },
      {
        name: 'api_version',
        type: 'text',
        label: 'API Version',
        placeholder: '2024-01',
        required: false,
        description: 'Shopify API version (default: 2024-01)'
      }
    ],
    scopes: ['read_orders', 'write_orders', 'read_products', 'read_customers'],
    docsUrl: 'https://shopify.dev/docs/api/admin-rest',
    setupInstructions: '1. Shopify Admin > Apps\n2. Develop apps > Create an app\n3. Configure Admin API scopes\n4. Install app and get access token'
  },

  // Communication
  slack: {
    platform: 'slack',
    displayName: 'Slack',
    authType: 'token',
    fields: [
      {
        name: 'bot_token',
        type: 'password',
        label: 'Bot User OAuth Token',
        placeholder: 'xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'Slack Bot Token starting with xoxb-'
      },
      {
        name: 'channel_id',
        type: 'text',
        label: 'Default Channel ID',
        placeholder: 'C01XXXXXXXXX',
        required: false,
        description: 'Default channel to post messages (optional)'
      }
    ],
    scopes: ['chat:write', 'channels:history', 'channels:read'],
    docsUrl: 'https://api.slack.com/authentication/token-types',
    setupInstructions: '1. Go to api.slack.com/apps\n2. Create New App\n3. OAuth & Permissions > Bot Token Scopes\n4. Install to Workspace'
  },

  // CRM & Productivity
  notion: {
    platform: 'notion',
    displayName: 'Notion',
    authType: 'token',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'Integration Token',
        placeholder: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'Notion Internal Integration Secret'
      },
      {
        name: 'database_id',
        type: 'text',
        label: 'Database ID',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: false,
        description: 'Default database ID (optional)'
      }
    ],
    scopes: ['read_content', 'update_content', 'insert_content'],
    docsUrl: 'https://developers.notion.com/docs/authorization',
    setupInstructions: '1. Go to notion.so/my-integrations\n2. Create new integration\n3. Copy Internal Integration Token\n4. Share database with integration'
  },

  airtable: {
    platform: 'airtable',
    displayName: 'Airtable',
    authType: 'token',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'Personal Access Token',
        placeholder: 'patxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'Airtable Personal Access Token'
      },
      {
        name: 'base_id',
        type: 'text',
        label: 'Base ID',
        placeholder: 'appXXXXXXXXXXXXXX',
        required: false,
        description: 'Default base ID (optional)'
      }
    ],
    scopes: ['data.records:read', 'data.records:write', 'schema.bases:read'],
    docsUrl: 'https://airtable.com/developers/web/api/introduction',
    setupInstructions: '1. Go to airtable.com/create/tokens\n2. Create new token\n3. Add required scopes\n4. Copy token'
  },

  // Payments
  stripe: {
    platform: 'stripe',
    displayName: 'Stripe',
    authType: 'api-key',
    fields: [
      {
        name: 'secret_key',
        type: 'password',
        label: 'Secret Key',
        placeholder: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'Stripe Secret API Key (use sk_test_ for testing)'
      },
      {
        name: 'publishable_key',
        type: 'text',
        label: 'Publishable Key',
        placeholder: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: false,
        description: 'Stripe Publishable Key (optional, for frontend)'
      }
    ],
    scopes: ['read_write'],
    docsUrl: 'https://stripe.com/docs/keys',
    setupInstructions: '1. Go to Stripe Dashboard\n2. Developers > API keys\n3. Copy Secret key (use test key for testing)'
  },

  // Development Tools
  github: {
    platform: 'github',
    displayName: 'GitHub',
    authType: 'token',
    fields: [
      {
        name: 'access_token',
        type: 'password',
        label: 'Personal Access Token',
        placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'GitHub Personal Access Token (classic)'
      },
      {
        name: 'repository',
        type: 'text',
        label: 'Repository',
        placeholder: 'owner/repo',
        required: false,
        description: 'Default repository (optional)'
      }
    ],
    scopes: ['repo', 'read:org'],
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
    setupInstructions: '1. GitHub Settings > Developer settings\n2. Personal access tokens > Tokens (classic)\n3. Generate new token with required scopes'
  },

  // Customer Support
  intercom: {
    platform: 'intercom',
    displayName: 'Intercom',
    authType: 'token',
    fields: [
      {
        name: 'access_token',
        type: 'password',
        label: 'Access Token',
        placeholder: 'dG9rOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'Intercom Access Token'
      }
    ],
    scopes: ['read', 'write'],
    docsUrl: 'https://developers.intercom.com/building-apps/docs/authentication-types',
    setupInstructions: '1. Intercom Settings > Developers\n2. Developer Hub > New app\n3. Authentication > Create access token'
  },

  // CRM
  hubspot: {
    platform: 'hubspot',
    displayName: 'HubSpot',
    authType: 'token',
    fields: [
      {
        name: 'access_token',
        type: 'password',
        label: 'Private App Access Token',
        placeholder: 'pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        required: true,
        description: 'HubSpot Private App Access Token'
      }
    ],
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read'],
    docsUrl: 'https://developers.hubspot.com/docs/api/private-apps',
    setupInstructions: '1. HubSpot Settings > Integrations > Private Apps\n2. Create private app\n3. Select required scopes\n4. Copy access token'
  },

  salesforce: {
    platform: 'salesforce',
    displayName: 'Salesforce',
    authType: 'oauth',
    fields: [
      {
        name: 'instance_url',
        type: 'url',
        label: 'Instance URL',
        placeholder: 'https://yourinstance.salesforce.com',
        required: true,
        description: 'Your Salesforce instance URL'
      },
      {
        name: 'access_token',
        type: 'password',
        label: 'Access Token',
        placeholder: '00D...!AR...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: true,
        description: 'OAuth Access Token'
      },
      {
        name: 'refresh_token',
        type: 'password',
        label: 'Refresh Token',
        placeholder: '5Aep...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        required: false,
        description: 'OAuth Refresh Token (for long-term access)'
      }
    ],
    scopes: ['api', 'refresh_token', 'offline_access'],
    docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_authentication.htm',
    setupInstructions: '1. Salesforce Setup > Apps > App Manager\n2. New Connected App\n3. Enable OAuth Settings\n4. Get OAuth tokens'
  }
};

/**
 * Get credential specification for a platform
 */
export function getCredentialSpec(platform: string): CredentialSpec | undefined {
  const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, '');
  return CREDENTIAL_REGISTRY[normalizedPlatform];
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): string[] {
  return Object.keys(CREDENTIAL_REGISTRY).map(key => CREDENTIAL_REGISTRY[key].displayName);
}

/**
 * Search for platform by name (fuzzy matching)
 */
export function findPlatform(searchTerm: string): CredentialSpec | undefined {
  const normalized = searchTerm.toLowerCase().replace(/\s+/g, '');
  
  // Exact match
  if (CREDENTIAL_REGISTRY[normalized]) {
    return CREDENTIAL_REGISTRY[normalized];
  }

  // Partial match
  for (const [key, spec] of Object.entries(CREDENTIAL_REGISTRY)) {
    if (key.includes(normalized) || spec.displayName.toLowerCase().includes(normalized)) {
      return spec;
    }
  }

  return undefined;
}

