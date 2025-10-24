# Configuración de Variables de Entorno

Este proyecto utiliza variables de entorno para configurar los endpoints de las APIs.

## 📋 Configuración Inicial

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env` con tus valores:**
   ```bash
   # API Endpoints
   API_BASE_URL=http://localhost:5000
   CODE_ANALYSIS_API_URL=http://localhost:5060
   API_TIMEOUT=10000
   ```

## 🔧 Variables Disponibles

| Variable | Descripción | Valor por defecto (desarrollo) | Valor producción |
|----------|-------------|-------------------------------|------------------|
| `API_BASE_URL` | URL del API principal | `http://localhost:5000` | Configurar según servidor |
| `CODE_ANALYSIS_API_URL` | URL del servicio de análisis | `http://localhost:5060` | Configurar según servidor |
| `API_TIMEOUT` | Timeout de peticiones HTTP (ms) | `10000` | `15000` |

## 🌍 Ambientes

### Desarrollo
- Archivo: `.env`
- Se usa al ejecutar `npm run start`
- Las URLs apuntan a localhost

### Producción
- Archivo: `.env.production`
- Se usa al hacer build para producción
- Las URLs deben apuntar a los servidores reales

## 🚀 Uso

Las variables de entorno se cargan automáticamente cuando:

1. **Proxy del servidor de desarrollo**: El archivo `src/proxy.config.js` lee las variables para configurar el proxy
2. **Servicios Angular**: Los archivos `environment.*.ts` contienen las configuraciones que usan los servicios

## 📝 Notas Importantes

- ⚠️ **NUNCA** commitees el archivo `.env` con credenciales reales
- ✅ El archivo `.env.example` sí debe estar en el repositorio como plantilla
- 🔒 El `.gitignore` ya está configurado para ignorar archivos `.env`

## 🛠️ Para cambiar un endpoint

1. Edita el archivo `.env`:
   ```bash
   CODE_ANALYSIS_API_URL=http://localhost:8080
   ```

2. Reinicia el servidor:
   ```bash
   npm run start
   ```
