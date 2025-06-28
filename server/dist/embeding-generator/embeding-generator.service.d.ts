import { ConfigService } from '@nestjs/config';
import { EmbeddingModelType } from './interfaces/embeding-generator.interface';
import { OpenAIEmbeddingGenerator } from './embending-generator-models/openai.embending-generator';
export declare class EmbedingGeneratorService {
    private configService;
    private openAIGenerator;
    private currentGenerator;
    constructor(configService: ConfigService, openAIGenerator: OpenAIEmbeddingGenerator);
    setGenerator(modelType: EmbeddingModelType): void;
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    getCurrentModelName(): string;
    getAvailableModels(): EmbeddingModelType[];
}
