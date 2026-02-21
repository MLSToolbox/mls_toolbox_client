# MLS Toolbox Client

Frontend Angular del MLS Toolbox.

## Rutas principales

- `/home` - Landing con herramientas
- `/pipeline_generator` - Editor visual de pipeline
- `/assess` - UI de Code Assessment

## Ejecución local

```bash
npm install
npm start
```

Servidor de desarrollo: `http://localhost:4200`

## Build

```bash
npm run build
```

## Configuración

El frontend usa `API_URL` (inyectado en build Docker) para llamar al gateway:
- Local típico: `http://localhost:5000/api`

Archivos de ejemplo:
- `.env.local.example`
- `.env.development.example`
- `.env.production.example`

## Docker

```bash
./docker_run.sh --env=local
```
