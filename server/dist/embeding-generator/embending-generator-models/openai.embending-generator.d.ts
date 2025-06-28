import { ConfigService } from '@nestjs/config';
import { EmbeddingGenerator } from '../interfaces/embeding-generator.interface';
export declare class OpenAIEmbeddingGenerator implements EmbeddingGenerator {
    private configService;
    private readonly apiKey;
    private readonly model;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    getModelName(): string;
}
