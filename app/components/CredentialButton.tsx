'use client';

import { useState } from 'react';

interface CredentialButtonProps {
  platform: string;
  onCredentialSubmit: (platform: string, credentials: Record<string, string>) => void;
}

interface CredentialField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  placeholder: string;
  required: boolean;
  description: string;
}

const PLATFORM_CREDENTIALS: Record<string, CredentialField[]> = {
  'OpenAI API': [
    {
      name: 'apiKey',
      label: 'API Key',
      type: 'password',
      placeholder: 'sk-...',
      required: true,
      description: 'Your OpenAI API key from https://platform.openai.com/api-keys'
    }
  ],
  'Shopify': [
    {
      name: 'shopDomain',
      label: 'Shop Domain',
      type: 'text',
      placeholder: 'your-shop.myshopify.com',
      required: true,
      description: 'Your Shopify store domain'
    },
    {
      name: 'accessToken',
      label: 'Access Token',
      type: 'password',
      placeholder: 'shpat_...',
      required: true,
      description: 'Admin API access token from https://your-shop.myshopify.com/admin/settings/apps'
    }
  ],
  'Stripe': [
    {
      name: 'secretKey',
      label: 'Secret Key',
      type: 'password',
      placeholder: 'sk_live_...',
      required: true,
      description: 'Secret key from https://dashboard.stripe.com/apikeys'
    },
    {
      name: 'publishableKey',
      label: 'Publishable Key',
      type: 'text',
      placeholder: 'pk_live_...',
      required: true,
      description: 'Publishable key from https://dashboard.stripe.com/apikeys'
    }
  ],
  'Slack': [
    {
      name: 'botToken',
      label: 'Bot Token',
      type: 'password',
      placeholder: 'xoxb-...',
      required: true,
      description: 'Bot token from https://api.slack.com/apps'
    },
    {
      name: 'appToken',
      label: 'App Token',
      type: 'password',
      placeholder: 'xapp-...',
      required: false,
      description: 'App-level token for socket mode (optional)'
    }
  ],
  'Discord': [
    {
      name: 'botToken',
      label: 'Bot Token',
      type: 'password',
      placeholder: 'MT...',
      required: true,
      description: 'Bot token from https://discord.com/developers/applications'
    }
  ],
  'Google Sheets': [
    {
      name: 'serviceAccountKey',
      label: 'Service Account JSON',
      type: 'textarea',
      placeholder: '{"type": "service_account", ...}',
      required: true,
      description: 'Service account JSON from Google Cloud Console'
    }
  ],
  'Mailchimp': [
    {
      name: 'apiKey',
      label: 'API Key',
      type: 'password',
      placeholder: 'your-api-key',
      required: true,
      description: 'API key from https://us1.admin.mailchimp.com/account/api/'
    },
    {
      name: 'serverPrefix',
      label: 'Server Prefix',
      type: 'text',
      placeholder: 'us1',
      required: true,
      description: 'Server prefix (us1, us2, etc.) from your API key'
    }
  ]
};

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  'OpenAI API': 'Get your API key from https://platform.openai.com/api-keys',
  'Shopify': 'Create an app at https://partners.shopify.com/ and get access tokens',
  'Stripe': 'Find your keys at https://dashboard.stripe.com/apikeys',
  'Slack': 'Create an app at https://api.slack.com/apps and get bot tokens',
  'Discord': 'Create an application at https://discord.com/developers/applications',
  'Google Sheets': 'Create a service account in Google Cloud Console',
  'Mailchimp': 'Get your API key from https://us1.admin.mailchimp.com/account/api/'
};

export default function CredentialButton({ platform, onCredentialSubmit }: CredentialButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = PLATFORM_CREDENTIALS[platform] || [];
  const instructions = PLATFORM_INSTRUCTIONS[platform] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const missingFields = fields.filter(field => field.required && !credentials[field.name]);
      if (missingFields.length > 0) {
        alert(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }

      await onCredentialSubmit(platform, credentials);
      setIsOpen(false);
      setCredentials({});
    } catch (error) {
      console.error('Error submitting credentials:', error);
      alert('Failed to save credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <>
      {/* Platform Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="credential-platform-button"
        type="button"
      >
        <div className="platform-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <span className="platform-name">{platform}</span>
        <span className="platform-action">Connect</span>
      </button>

      {/* Credential Modal */}
      {isOpen && (
        <div className="credential-modal-overlay">
          <div className="credential-modal">
            <div className="modal-header">
              <h3>Connect {platform}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="modal-close"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="instructions">
                <h4>How to get your credentials:</h4>
                <p>{instructions}</p>
              </div>

              <form onSubmit={handleSubmit} className="credential-form">
                {fields.map((field) => (
                  <div key={field.name} className="form-field">
                    <label htmlFor={field.name} className="field-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.name}
                        value={credentials[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="field-input"
                        rows={4}
                        required={field.required}
                      />
                    ) : (
                      <input
                        id={field.name}
                        type={field.type}
                        value={credentials[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="field-input"
                        required={field.required}
                      />
                    )}
                    <p className="field-description">{field.description}</p>
                  </div>
                ))}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-button"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
