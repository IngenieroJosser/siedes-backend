import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { loadEnvFile } from 'node:process';

// Carga .env en desarrollo local antes de instanciar los providers de NestJS.
// En contenedores/producción las variables inyectadas por el entorno tienen prioridad.
try {
  loadEnvFile();
} catch (error) {
  const code = (error as NodeJS.ErrnoException)?.code;
  if (code !== 'ENOENT') {
    // No detenemos el arranque: la validación específica de cada integración
    // reportará variables faltantes con mensajes más útiles.
    console.warn('No fue posible cargar .env:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,https://siedes.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('SIEDES API')
    // .setDescription(`
    //   <div class="siedes-header">
    //     <h1>Plataforma Predictiva y Culturalmente Afrocentrada</h1>
    //     <p class="subtitle">Tecnología con propósito social para Quibdó y Colombia</p>
    //     <div class="mission-statement">
    //       <p>
    //         SIEDES combina inteligencia artificial, análisis predictivo y enfoque etnoeducativo 
    //         para identificar y prevenir la deserción escolar en contextos de vulnerabilidad, 
    //         honrando la herencia cultural afrocolombiana y promoviendo la equidad educativa.
    //       </p>
    //     </div>
    //   </div>
    // `)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const customCss = `
    /* Global Styles */
    .swagger-ui {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* Custom header styling */
    .siedes-header {
      background: linear-gradient(135deg, #00161a 0%, #0a2e33 100%);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      margin-bottom: 20px;
      border-left: 5px solid #AC4A00;
    }
    
    .siedes-header h1 {
      color: #F8F0AF;
      margin: 0 0 15px 0;
      font-size: 32px;
      font-weight: 700;
      text-align: center;
    }
    
    .siedes-header .subtitle {
      color: #F8F0AF;
      font-size: 20px;
      text-align: center;
      margin: 0 0 20px 0;
    }
    
    .siedes-header .mission-statement {
      background: rgba(248, 240, 175, 0.1);
      padding: 20px;
      border-radius: 8px;
    }
    
    .siedes-header .mission-statement p {
      color: #F8F0AF;
      margin: 0;
      line-height: 1.6;
      text-align: justify;
    }
    
    /* Top bar styling */
    .swagger-ui .topbar {
      background: linear-gradient(90deg, #00161a 0%, #0a2e33 100%);
      height: 80px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      border-bottom: 3px solid #AC4A00;
    }
    
    .swagger-ui .topbar-wrapper a {
      display: flex;
      align-items: center;
    }
    
    .swagger-ui .topbar-wrapper img {
      content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><rect x="0" y="0" width="24" height="24" fill="%23F8F0AF" /><text x="12" y="18" font-family="Arial" font-size="14" fill="%2300161a" text-anchor="middle">SI</text></svg>');
      margin-right: 10px;
    }
    
    /* Info section styling */
    .swagger-ui .info hgroup.main {
      margin-bottom: 30px;
    }
    
    .swagger-ui .info .title {
      color: #AC4A00;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 10px;
    }
    
    .swagger-ui .info p {
      color: #5c6b73;
      font-size: 16px;
      line-height: 1.6;
    }
    
    /* HTTP methods styling */
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #00161a;
      border-radius: 4px;
      font-weight: 700;
      box-shadow: 0 2px 5px rgba(0,22,26,0.3);
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #AC4A00;
      border-radius: 4px;
      font-weight: 700;
      box-shadow: 0 2px 5px rgba(172,74,0,0.3);
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #F8F0AF;
      color: #00161a;
      border-radius: 4px;
      font-weight: 700;
      box-shadow: 0 2px 5px rgba(248,240,175,0.3);
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #d9534f;
      border-radius: 4px;
      font-weight: 700;
      box-shadow: 0 2px 5px rgba(217,83,79,0.3);
    }
    
    /* Operation block styling */
    .swagger-ui .opblock {
      border: 1px solid #d0d7de;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .swagger-ui .opblock:hover {
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    
    .swagger-ui .opblock .opblock-summary {
      padding: 15px;
      border-bottom: 1px solid #eaecef;
    }
    
    .swagger-ui .opblock .opblock-summary-description {
      font-size: 16px;
      color: #5c6b73;
    }
    
    .swagger-ui .opblock.is-open .opblock-summary {
      border-bottom: 1px solid #eaecef;
      background-color: rgba(248, 240, 175, 0.1);
    }
    
    /* Tag styling */
    .swagger-ui .opblock-tag {
      font-size: 28px;
      color: #00161a;
      font-weight: 700;
      margin: 40px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #AC4A00;
    }
    
    .swagger-ui .opblock-tag:hover {
      color: #AC4A00;
    }
    
    /* Button styling */
    .swagger-ui .btn.authorize {
      background-color: #F8F0AF;
      color: #00161a;
      border: 2px solid #AC4A00;
      border-radius: 4px;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    
    .swagger-ui .btn.authorize:hover {
      background-color: #AC4A00;
      color: #F8F0AF;
    }
    
    /* Model styling */
    .swagger-ui .model-title {
      color: #AC4A00;
      font-weight: 600;
    }
    
    .swagger-ui section.models {
      background: rgba(0,22,26,0.03);
      border: 1px solid rgba(0,22,26,0.1);
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .swagger-ui section.models:hover {
      background: rgba(0,22,26,0.05);
      border-color: rgba(0,22,26,0.2);
    }
    
    /* Table styling */
    .swagger-ui table thead tr th {
      color: #AC4A00;
      font-weight: 600;
      border-bottom: 2px solid #AC4A00;
    }
    
    .swagger-ui table tbody tr td {
      border-bottom: 1px solid #eaecef;
    }
    
    /* Input field styling */
    .swagger-ui input[type="text"] {
      border: 1px solid #d0d7de;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 14px;
    }
    
    .swagger-ui input[type="text"]:focus {
      border-color: #AC4A00;
      box-shadow: 0 0 0 3px rgba(172,74,0,0.2);
      outline: none;
    }
    
    /* Tab styling */
    .swagger-ui .tab li {
      margin-right: 10px;
    }
    
    .swagger-ui .tab li button {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .swagger-ui .tab li button[aria-selected="true"] {
      color: #F8F0AF;
      background-color: #00161a;
      border-color: #00161a;
    }
    
    .swagger-ui .tab li button:hover {
      background-color: rgba(0,22,26,0.1);
    }
    
    /* Code snippet styling */
    .swagger-ui .microlight {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background-color: rgba(0,22,26,0.05);
      border-radius: 4px;
      padding: 2px 4px;
    }
    
    /* Response codes styling */
    .swagger-ui .response-col_status {
      color: #AC4A00;
      font-weight: 600;
    }
    
    /* Custom badge for version */
    .version-stamp {
      background: #AC4A00;
      color: #F8F0AF;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
    
    /* Loading animation */
    .swagger-ui .loading:after {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #AC4A00;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const customJs = `
    // Add version badge to the title
    document.addEventListener('DOMContentLoaded', function() {
      // Add custom header with cultural pattern
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        const culturalHeader = document.createElement('div');
        culturalHeader.style.height = '4px';
        culturalHeader.style.background = 'linear-gradient(90deg, #F8F0AF 0%, #AC4A00 50%, #00161a 100%)';
        culturalHeader.style.width = '100%';
        culturalHeader.style.position = 'absolute';
        culturalHeader.style.bottom = '0';
        topbar.style.position = 'relative';
        topbar.appendChild(culturalHeader);
      }
    });
  `;

  const customOptions = {
    customCss,
    customJs,
    customSiteTitle: 'SIEDES API - Plataforma Afrocentrada',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    }
  };

  SwaggerModule.setup('siedes', app, document, customOptions);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();