import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    // Inicializar con el modelo por defecto
    const defaultModel =
      this.configService.get<string>('EMBEDDING_MODEL_TYPE') ||
      EmbeddingModelType.OPENAI;
    this.setGenerator(defaultModel as EmbeddingModelType);
  }

  setGenerator(modelType: EmbeddingModelType): void {
    switch (modelType) {
      case EmbeddingModelType.OPENAI:
        this.currentGenerator = this.openAIGenerator;
        break;
      // Aquí puedes agregar más casos para otros modelos
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
