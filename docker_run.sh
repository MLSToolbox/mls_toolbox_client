#!/bin/bash

# Script unificado para construir y ejecutar el contenedor Docker del frontend
# Usa docker compose: el build de Angular se ejecuta en un contenedor temporal
# y nginx sirve los archivos compilados desde un bind mount

set -e

ENVIRONMENT="local"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    cat << EOF
Uso: ./docker_run.sh [OPTIONS]

Construye y ejecuta el contenedor Docker del frontend usando docker compose.
Angular se compila en un contenedor temporal y nginx sirve los archivos desde ./dist/.

Opciones:
    --env=ENVIRONMENT    Ambiente a usar: local, development, production (default: local)
    --build              Compilar Angular y (re)crear contenedor nginx
    --rebuild            Recompilar Angular tras git pull y reiniciar nginx
    --restart            Reiniciar nginx sin recompilar
    --down               Detener y eliminar contenedores
    --logs               Ver logs del contenedor
    -h, --help           Muestra esta ayuda

Ejemplos:
    ./docker_run.sh --env=production --build    # Primera vez: compila y levanta
    ./docker_run.sh --env=production --rebuild  # Tras git pull: recompila y reinicia
    ./docker_run.sh --env=production --restart  # Solo reinicia nginx
    ./docker_run.sh --down                      # Detiene el contenedor

Flujo típico en EC2:
    1. Primera vez:  ./docker_run.sh --env=production --build
    2. Actualizar:   git pull && ./docker_run.sh --env=production --rebuild
    3. Solo nginx:   ./docker_run.sh --env=production --restart
EOF
}

ACTION="build"
for arg in "$@"; do
    case $arg in
        --env=*)
            ENVIRONMENT="${arg#*=}"
            shift
            ;;
        --build)
            ACTION="build"
            shift
            ;;
        --rebuild)
            ACTION="rebuild"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        --down)
            ACTION="down"
            shift
            ;;
        --logs)
            ACTION="logs"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Error: Argumento desconocido '$arg'"
            show_help
            exit 1
            ;;
    esac
done

if [[ ! "$ENVIRONMENT" =~ ^(local|development|production)$ ]]; then
    echo "Error: Ambiente '$ENVIRONMENT' no válido. Usa: local, development, o production"
    exit 1
fi

ENV_FILE="$SCRIPT_DIR/.env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    echo "Advertencia: Archivo $ENV_FILE no encontrado."
    echo "Copiando desde .env.$ENVIRONMENT.example..."
    if [ -f "$SCRIPT_DIR/.env.$ENVIRONMENT.example" ]; then
        cp "$SCRIPT_DIR/.env.$ENVIRONMENT.example" "$ENV_FILE"
    else
        echo "Error: No se encuentra .env.$ENVIRONMENT.example"
        exit 1
    fi
fi

echo "=========================================="
echo "Frontend MLS Toolbox - Ambiente: $ENVIRONMENT"
echo "=========================================="

cd "$SCRIPT_DIR"

build_angular() {
    echo ""
    echo "Compilando Angular (ambiente: $ENVIRONMENT)..."
    echo "=========================================="
    docker compose --env-file "$ENV_FILE" --profile build run --rm client-build
    echo "Angular compilado en ./dist/frontend/"
}

case $ACTION in
    build)
        build_angular
        echo ""
        echo "Levantando nginx..."
        docker compose --env-file "$ENV_FILE" up -d client
        echo ""
        echo "=========================================="
        echo "Frontend corriendo"
        echo "=========================================="
        echo "Ambiente: $ENVIRONMENT"
        echo ""
        echo "Para ver logs:       ./docker_run.sh --env=$ENVIRONMENT --logs"
        echo "Tras git pull:       ./docker_run.sh --env=$ENVIRONMENT --rebuild"
        echo "Para detener:        ./docker_run.sh --env=$ENVIRONMENT --down"
        echo "=========================================="
        ;;
    rebuild)
        build_angular
        echo ""
        echo "Reiniciando nginx..."
        docker compose --env-file "$ENV_FILE" restart client
        echo "Frontend actualizado."
        ;;
    restart)
        echo ""
        echo "Reiniciando nginx..."
        docker compose --env-file "$ENV_FILE" restart client
        echo "Nginx reiniciado."
        ;;
    down)
        echo ""
        echo "Deteniendo contenedor..."
        docker compose --env-file "$ENV_FILE" --profile build down
        echo "Contenedor detenido."
        ;;
    logs)
        docker compose --env-file "$ENV_FILE" logs -f client
        ;;
esac
