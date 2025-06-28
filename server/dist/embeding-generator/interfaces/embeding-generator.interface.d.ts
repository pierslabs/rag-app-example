export interface EmbeddingGenerator {
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    getModelName(): string;
}
export declare enum EmbeddingModelType {
    OPENAI = "openai",
    HUGGINGFACE = "huggingface",
    COHERE = "cohere"
}
