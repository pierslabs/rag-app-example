import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import {
  EmbeddingGenerator,
  EmbeddingModelType,
} from './interfaces/embeding-generator.interface';
import { OpenAIEmbeddingGenerator } from './embending-generator-models/openai.embending-generator';

@Injectable()
export class EmbedingGeneratorService {
  private currentGenerator: EmbeddingGenerator;

  constructor(
    private configService: ConfigService,
    private openAIGenerator: OpenAIEmbeddingGenerator,
  ) {
    const defaultModel = this.configService.ai.embeddingModel;
    const modelType = this.mapModelToType(defaultModel as string);
    this.setGenerator(modelType);
  }

  private mapModelToType(model: string): EmbeddingModelType {
    // Modelos de OpenAI
    if (model.includes('text-embedding')) {
      return EmbeddingModelType.OPENAI;
    }

    // Modelos de Hugging Face
    if (
      model.includes('sentence-transformers') ||
      model.includes('all-MiniLM')
    ) {
      return EmbeddingModelType.HUGGINGFACE;
    }

    // Modelos de Cohere
    if (model.includes('embed-') || model.includes('cohere')) {
      return EmbeddingModelType.COHERE;
    }

    // Por defecto, asume OpenAI
    console.warn(`⚠️ Unrecognized model: ${model}, defaulting to OpenAI`);
    return EmbeddingModelType.OPENAI;
  }

  setGenerator(modelType: EmbeddingModelType): void {
    switch (modelType) {
      case EmbeddingModelType.OPENAI:
        this.currentGenerator = this.openAIGenerator;
        break;
   
      // case EmbeddingModelType.HUGGINGFACE:
      //   this.currentGenerator = this.huggingFaceGenerator;
      //   break;
      default:
        throw new Error(`Unsupported embedding model type: ${modelType}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.currentGenerator.generateEmbedding(text);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.currentGenerator.generateEmbeddings(texts);
  }

  getCurrentModelName(): string {
    return this.currentGenerator.getModelName();
  }

  getAvailableModels(): EmbeddingModelType[] {
    return Object.values(EmbeddingModelType);
  }
}
