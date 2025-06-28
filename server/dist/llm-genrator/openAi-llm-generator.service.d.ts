import { ConfigService } from '@nestjs/config';
import { LLMGenerator } from './interfaces/llm-generator.interface';
export declare class OpenAILLMGenerator implements LLMGenerator {
    private configService;
    private readonly apiKey;
    private readonly model;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    generateResponse(context: string, question: string): Promise<string>;
    generateStreamResponse(context: string, question: string): AsyncGenerator<string, void, unknown>;
    getModelName(): string;
}
