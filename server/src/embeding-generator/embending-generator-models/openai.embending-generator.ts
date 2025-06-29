import { Injectable } from '@nestjs/common';

import { EmbeddingGenerator } from '../interfaces/embeding-generator.interface';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class OpenAIEmbeddingGenerator implements EmbeddingGenerator {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.ai.openaiApiKey;
    this.model =
      this.configService.ai.embeddingModel || 'text-embedding-3-small';
    this.apiUrl = this.configService.ai.openAiEmbeddingUrl;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: this.model,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  getModelName(): string {
    return `OpenAI ${this.model}`;
  }
}
