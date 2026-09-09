# Integración SIEDES Backend ↔ SIEDES AI

El módulo `src/prediction` estaba vacío en el proyecto recibido. Esta versión lo conecta con el microservicio Python/FastAPI.

## Variables

```env
AI_SERVICE_URL=http://localhost:8000
AI_TIMEOUT_MS=7000
```

## Endpoints

```http
GET /prediction/health
POST /prediction/students/:studentId
POST /prediction/students/:studentId?persist=false
```

El backend:

1. consulta el estudiante, institución, contexto y último registro académico con Prisma;
2. construye el contrato JSON de SIEDES AI;
3. llama `POST /v1/predict/student`;
4. valida que la probabilidad esté entre 0 y 1;
5. actualiza `Estudiante.riesgoDesercion` si `persist` no es `false`.

La base de datos sigue siendo responsabilidad de NestJS. El microservicio Python no recibe credenciales de PostgreSQL.

## Nota metodológica

Mientras no exista un clasificador individual entrenado con outcomes históricos reales, SIEDES AI responde `model_type=hybrid_baseline`. No debe mostrarse al usuario como una predicción ML individual validada.
