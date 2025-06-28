# 🧠 Sistema RAG (Retrieval-Augmented Generation)

Sistema inteligente de búsqueda semántica y generación de respuestas basado en conocimiento de dominio específico para
restaurantes.

## 📋 Descripción

Este proyecto implementa un sistema RAG que combina búsqueda semántica con embeddings vectoriales, generación de
respuestas con OpenAI GPT, base de datos vectorial con ChromaDB, conocimiento específico sobre restaurantes y menús, y
streaming en tiempo real para respuestas interactivas.

## 🚀 Funcionalidades Actuales

### Búsqueda Semántica

- Búsqueda por contenido usando embeddings vectoriales
- Filtrado por categorías (bebidas, arroces, entrantes, etc.)
- Resultados rankeados por relevancia semántica

### Generación RAG

- Respuestas contextuales basadas en conocimiento específico
- Streaming de respuestas en tiempo real (SSE)
- Combinación de búsqueda + generación de IA

### Gestión de Conocimiento

- Procesamiento automático de documentos
- Generación y regeneración de embeddings
- Estadísticas y métricas del sistema

## 📡 API Endpoints

### POST /semantic-search/search

Realiza búsqueda semántica general en toda la base de conocimiento.

- Body: question (string), maxResults (number, opcional)
- Respuesta: Array de resultados con content, category y score

### POST /semantic-search/search/category

Búsqueda semántica filtrada por categoría específica.

- Body: question (string), category (string), maxResults (number, opcional)
- Respuesta: Resultados filtrados por categoría

### POST /semantic-search/rag

Genera respuesta completa usando RAG (búsqueda + IA).

- Body: question (string), maxResults (number, opcional)
- Respuesta: answer (string) y sources (array)

### GET /semantic-search/rag/stream

Respuesta RAG en tiempo real con Server-Sent Events.

- Query Params: question (string), maxResults (number, default: 3)
- Respuesta: Stream de chunks de texto

### GET /semantic-search/categories

Obtiene todas las categorías disponibles en la base de conocimiento.

- Respuesta: Array de categorías y timestamp

### GET /semantic-search/info

Información general sobre la base de conocimiento.

- Respuesta: totalDocuments, totalCategories, lastUpdate, embeddingModel

### GET /semantic-search/stats

Estadísticas detalladas del sistema.

- Respuesta: searches, avgResponseTime, topCategories, performanceMetrics

### POST /semantic-search/refresh

Refresca la base de conocimiento sin regenerar embeddings.

- Respuesta: success (boolean), message (string), timestamp

### POST /semantic-search/regenerate-embeddings

Regenera todos los embeddings de la base de conocimiento.

- Respuesta: success (boolean), message (string), details (object)

### DELETE /semantic-search/reset

Resetea completamente la base de conocimiento.

- Respuesta: success (boolean), message (string)

### POST /semantic-search/process-specific-data

Procesa un tipo específico de datos.

- Body: dataType (string)
- Respuesta: success (boolean), message (string)

## 🛠️ Tecnologías Utilizadas

- Framework: NestJS + TypeScript
- IA: OpenAI GPT-4 + Embeddings
- Base de Datos Vectorial: ChromaDB
- Streaming: Server-Sent Events (SSE)
- Gestión de Estado: RxJS Observables
- Configuración: @nestjs/config

## 📈 Próximos Pasos

### En Desarrollo

- [ ] Refactor de Código - Mejora de la estructura, legibilidad y namings
- [ ] Swagger/OpenAPI - Documentación interactiva de la API
- [ ] Sistema de Configuración - Gestión avanzada de configuración
- [ ] Autenticación - Sistema de usuarios y permisos
- [ ] Frontend - Interfaz web para interactuar con el sistema
- [ ] Docker - Containerización completa del sistema

### Mejoras Planificadas

- [ ] Cache inteligente - Sistema de caché para respuestas frecuentes
- [ ] Análisis de sentimientos - Análisis del tono de las consultas

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

Desarrollado con ❤️ usando NestJS y OpenAI