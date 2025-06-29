import { Injectable } from '@nestjs/common';

import { LLMGenerator } from './interfaces/llm-generator.interface';
import { ConfigService } from '../config/config.service';

@Injectable()
export class OpenAILLMGenerator implements LLMGenerator {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.model = this.configService.ai.chatModel || 'gpt-3.5-turbo';
    this.apiKey = this.configService.ai.openaiApiKey;
  }

  async generateResponse(context: string, question: string): Promise<string> {
    const systemPrompt = this.configService.ai.systemPrompt;
    const completeSystemPrompt = `${systemPrompt} ${context}`;
    const userPrompt = this.configService.ai.userPrompt;

    const contextPrompt = this.configService.ai.contextPrompt;
    const completeUserPrompt = `${contextPrompt} ${userPrompt}  ${question}`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: completeSystemPrompt },
            { role: 'user', content: completeUserPrompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating LLM response:', error);
      throw error;
    }
  }

  // Real-time response
  async *generateStreamResponse(
    context: string,
    question: string,
  ): AsyncGenerator<string, void, unknown> {
    const systemPrompt = this.configService.ai.systemPrompt;
    const completeSystemPrompt = `${systemPrompt} ${context}`;

    const userPrompt = this.configService.ai.userPrompt;

    const contextPrompt = this.configService.ai.contextPrompt;
    const completeUserPrompt = `${contextPrompt} ${userPrompt}  ${question}`;
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: completeSystemPrompt },
            { role: 'user', content: completeUserPrompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (parseError) {
                // Ignorar errores de parsing de chunks individuales
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error in stream response:', error);
      throw error;
    }
  }

  getModelName(): string {
    return `OpenAI ${this.model}`;
  }
}
