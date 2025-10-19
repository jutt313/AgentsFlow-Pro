/**
 * DeepSeek R1 v3 API Integration
 * Handles all communication with DeepSeek AI API
 */

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekChatCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface DeepSeekChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    this.model = 'deepseek-chat'; // DeepSeek R1 v3 model name
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(
    messages: DeepSeekMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          top_p: options?.topP || 0.9,
        } as DeepSeekChatCompletionRequest),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }

      const data: DeepSeekChatCompletionResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from DeepSeek API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  }

  /**
   * Stream chat completion (for real-time responses)
   */
  async *streamChatCompletion(
    messages: DeepSeekMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): AsyncGenerator<string> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: true,
        } as DeepSeekChatCompletionRequest),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek Streaming Error:', error);
      throw error;
    }
  }

  /**
   * Analyze business requirements using structured prompt
   */
  async analyzeBusinessRequirements(userInput: string): Promise<{
    industry: string;
    businessType: string;
    requiredFunctions: string[];
    automationOpportunities: string[];
    requiredIntegrations: string[];
    recommendedTeamSize: number;
  }> {
    const systemPrompt = `You are a business analysis expert. Analyze the business description and return a structured JSON response with:
- industry (string)
- businessType (string)
- requiredFunctions (array of strings)
- automationOpportunities (array of strings)
- requiredIntegrations (array of strings)
- recommendedTeamSize (number)

Return ONLY valid JSON, no additional text.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this business: ${userInput}` },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.3, // Lower temperature for more structured output
      maxTokens: 1000,
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse business analysis:', error);
      throw new Error('Invalid business analysis response');
    }
  }

  /**
   * Generate intelligent follow-up questions based on conversation context
   */
  async generateFollowUpQuestions(
    businessContext: any,
    conversationHistory: DeepSeekMessage[]
  ): Promise<string[]> {
    const systemPrompt = `You are a business consultant. Based on the conversation, generate 2-3 specific follow-up questions to better understand the user's needs. Return as JSON array of strings.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      {
        role: 'user',
        content: `Business context: ${JSON.stringify(businessContext)}. What follow-up questions should I ask?`,
      },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // If parsing fails, return a default question
      return ['Could you tell me more about your specific requirements?'];
    }
  }

  /**
   * Generate conversational response using Designer Agent persona
   */
  async generateDesignerResponse(
    systemPrompt: string,
    conversationHistory: DeepSeekMessage[],
    currentContext?: any
  ): Promise<string> {
    try {
      console.log('DeepSeek API Key exists:', !!this.apiKey);
      console.log('DeepSeek API URL:', this.apiUrl);
      console.log('Model:', this.model);
      
      const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ];

      // Add context if provided
      if (currentContext) {
        messages.push({
          role: 'system',
          content: `Current conversation context: ${JSON.stringify(currentContext)}`,
        });
      }

      console.log('Sending messages to DeepSeek:', messages.length, 'messages');
      
      const response = await this.createChatCompletion(messages, {
        temperature: 0.8, // Higher temperature for more natural conversation
        maxTokens: 2000,
      });
      
      console.log('DeepSeek response received:', response?.substring(0, 100) + '...');
      return response;
    } catch (error) {
      console.error('DeepSeek generateDesignerResponse error:', error);
      throw error;
    }
  }

  /**
   * Validate and structure blueprint data
   */
  async validateBlueprint(blueprintData: any): Promise<{
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  }> {
    const systemPrompt = `You are a technical validator. Analyze the blueprint and return JSON with:
- isValid (boolean)
- errors (array of strings, issues that must be fixed)
- suggestions (array of strings, optional improvements)

Return ONLY valid JSON.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Validate this blueprint: ${JSON.stringify(blueprintData)}`,
      },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.2, // Very low temperature for consistent validation
      maxTokens: 1000,
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to validate blueprint structure'],
        suggestions: [],
      };
    }
  }

  async discoverIntegrationCredentials(platformName: string): Promise<Array<{ name: string; description: string }>> {
    console.log(`Discovering credentials for ${platformName}...`);

    // HACK: Assuming `google_web_search` and `web_fetch` are available in the global scope.
    // This is a temporary solution to allow the agent to use these tools from within this class.
    const google_web_search = (global as any).google_web_search;
    const web_fetch = (global as any).web_fetch;

    if (!google_web_search || !web_fetch) {
      console.error('google_web_search or web_fetch not available in global scope.');
      return [];
    }

    // 1. Search for API documentation
    const searchQuery = `how to get API credentials for ${platformName}`;
    console.log(`Searching with query: ${searchQuery}`);
    const searchResults = await google_web_search({ query: searchQuery });
    
    if (!searchResults.results || searchResults.results.length === 0) {
      console.log('No search results found.');
      return [];
    }

    // 2. Fetch content from the top search result
    const topResult = searchResults.results[0];
    console.log(`Fetching content from: ${topResult.url}`);
    const webContent = await web_fetch({ prompt: `Please fetch the content of the URL ${topResult.url}` });

    if (!webContent.content) {
      console.log('Failed to fetch web content.');
      return [];
    }

    // 3. Use LLM to extract credentials from the content
    const systemPrompt = `You are an expert developer. Your task is to analyze the provided API documentation and extract the required credentials for authentication. Return a JSON array of objects, where each object has a "name" (the credential name, e.g., "API Key") and a "description" (a brief explanation of what it is).

    For example:
    [
      { "name": "API Key", "description": "Your public API key for accessing the service." },
      { "name": "API Secret", "description": "Your secret key for signing requests." }
    ]

    Return ONLY the valid JSON array, with no additional text or explanation. If no credentials are found, return an empty array.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this documentation for ${platformName}:\n\n${webContent.content}` },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 1000,
    });

    try {
      const credentials = JSON.parse(response);
      console.log(`Discovered credentials for ${platformName}:`, credentials);
      return credentials;
    } catch (error) {
      console.error('Failed to parse credentials from LLM response:', error);
      return [];
    }
  }
}

// Export singleton instance
export const deepseek = new DeepSeekClient();

// Export types
export type { DeepSeekMessage };

