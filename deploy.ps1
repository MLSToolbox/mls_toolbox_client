
docker stop mls_toolbox_client 2>$null
docker rm mls_toolbox_client 2>$null


docker rmi mls_toolbox_client 2>$null


Write-Host "Construyendo nueva imagen..." -ForegroundColor Green
docker build -t mls_toolbox_client .


if ($LASTEXITCODE -eq 0) {
    Write-Host "Levantando contenedor..." -ForegroundColor Green
    docker run -d -p 4200:80 --rm --network mls-network --name mls_toolbox_client mls_toolbox_client
    Write-Host "Aplicación disponible en http://localhost:4200" -ForegroundColor Yellow
} else {
    Write-Host "Error en la construcción. Revisa los logs." -ForegroundColor Red
}