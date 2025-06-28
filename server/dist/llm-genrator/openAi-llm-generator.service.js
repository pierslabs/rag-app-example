"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAILLMGenerator = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let OpenAILLMGenerator = class OpenAILLMGenerator {
    configService;
    apiKey;
    model;
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('OPENAI_API_KEY');
        this.model =
            this.configService.get('OPENAI_LLM_MODEL') || 'gpt-3.5-turbo';
    }
    async generateResponse(context, question) {
        const systemPrompt = `Eres un asistente experto del restaurante. Tu trabajo es responder preguntas de los clientes usando la información proporcionada.

INSTRUCCIONES:
- Responde SOLO basándote en la información del contexto proporcionado
- Si la información no está en el contexto, di que no tienes esa información específica
- Responde de manera amigable y profesional
- Mantén las respuestas concisas pero informativas
- Si mencionas precios, horarios o detalles específicos, asegúrate de que estén en el contexto

CONTEXTO DEL RESTAURANTE:
${context}`;
        const userPrompt = `Pregunta del cliente: ${question}

Por favor responde basándote únicamente en la información del contexto proporcionado.`;
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        }
        catch (error) {
            console.error('Error generating LLM response:', error);
            throw error;
        }
    }
    async *generateStreamResponse(context, question) {
        const systemPrompt = `Eres un asistente experto del restaurante. Tu trabajo es responder preguntas de los clientes usando la información proporcionada.

INSTRUCCIONES:
- Responde SOLO basándote en la información del contexto proporcionado
- Si la información no está en el contexto, di que no tienes esa información específica
- Responde de manera amigable y profesional
- Mantén las respuestas concisas pero informativas

CONTEXTO DEL RESTAURANTE:
${context}`;
        const userPrompt = `Pregunta del cliente: ${question}

Por favor responde basándote únicamente en la información del contexto proporcionado.`;
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    stream: true,
                }),
            });
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body reader available');
            }
            const decoder = new TextDecoder();
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]')
                                return;
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    yield content;
                                }
                            }
                            catch (parseError) {
                                continue;
                            }
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
        }
        catch (error) {
            console.error('Error in stream response:', error);
            throw error;
        }
    }
    getModelName() {
        return `OpenAI ${this.model}`;
    }
};
exports.OpenAILLMGenerator = OpenAILLMGenerator;
exports.OpenAILLMGenerator = OpenAILLMGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAILLMGenerator);
//# sourceMappingURL=openAi-llm-generator.service.js.map