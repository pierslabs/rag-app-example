import { registerAs } from '@nestjs/config';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import * as process from 'node:process';

export class AiConfigDto {
  @IsString()
  openaiApiKey: string;

  @IsString()
  @IsOptional()
  @IsIn(['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'])
  chatModel?: string = 'gpt-4';

  @IsString()
  @IsOptional()
  @IsIn(['text-embedding-3-small', 'text-embedding-3-large'])
  embeddingModel?: string = 'text-embedding-3-small';

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number = 0.3;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(4096)
  @IsOptional()
  maxTokens?: number = 1000;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000)
  @Max(60000)
  @IsOptional()
  requestTimeout?: number = 30000;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxRetries?: number = 3;

  @IsString()
  @IsOptional()
  systemPrompt?: string =
    'Eres un asistente experto del restaurante. Tu trabajo es responder preguntas de los clientes usando la información proporcionada.' +
    'INSTRUCCIONES:' +
    '- Responde SOLO basándote en la información del contexto proporcionado' +
    '- Si la información no está en el contexto, di que no tienes esa información específica' +
    '- Responde de manera amigable y profesional  - Mantén las respuestas concisas pero informativas' +
    '- Si mencionas precios, horarios o detalles específicos, asegúrate de que estén en el contexto,' +
    ' CONTEXTO DEL RESTAURANTE:';
  @IsString()
  userPrompt: string = 'Pregunta del cliente:';

  @IsString()
  contextPrompt: string =
    'Por favor responde basándote únicamente en la información del contexto proporcionado.';
  @IsString()
  openAiEmbeddingUrl: string;
}

export const aiConfig = registerAs(
  'ai',
  (): AiConfigDto => ({
    openaiApiKey: process.env.OPENAI_API_KEY || 'your-open,ai-api-key',
    chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4',
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10),
    requestTimeout: parseInt(process.env.OPENAI_REQUEST_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10),
    systemPrompt:
      process.env.OPENAI_SYSTEM_PROMPT ||
      'Eres un asistente experto en restaurantes. Responde de manera útil y precisa basándote en el contexto proporcionado.',
    openAiEmbeddingUrl:
      process.env.OPENAI_EMBEDDING_URL ||
      'https://api.openai.com/v1/embeddings',
    userPrompt: process.env.OPENAI_USER_PROMPT || 'Pregunta del cliente:',
    contextPrompt:
      process.env.OPENAI_CONTEXT_PROMPT ||
      ' Por favor responde basándote únicamente en la información del contexto proporcionado.',
  }),
);
