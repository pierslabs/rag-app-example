export interface LLMGenerator {
  generateResponse(context: string, question: string): Promise<string>;

  generateStreamResponse?(
    context: string,
    question: string,
  ): AsyncGenerator<string, void, unknown>;

  getModelName(): string;
}
