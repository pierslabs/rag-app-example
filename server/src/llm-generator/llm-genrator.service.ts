import { Injectable } from '@nestjs/common';
import { OpenAILLMGenerator } from './openAi-llm-generator.service';

@Injectable()
export class LLMGeneratorService extends OpenAILLMGenerator {
  getCurrentModelName(): string {
    return this.getModelName();
  }
}
