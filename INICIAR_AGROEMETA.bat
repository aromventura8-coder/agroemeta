@echo off
title AGROEMETA // NUCLEO AGI DE AGRONOMIA Y MECANICA
color 0B

echo ==============================================================================
echo                      AGROEMETA // JARVIS AGI CORE
echo        Asistente Inteligente de Agronomia, Mecanica Agricola y Telemetria
echo ==============================================================================
echo.
echo [*] Iniciando servidor neuronal local...
cd /d "%~dp0"

:: Iniciar el servidor Python en segundo plano si no esta corriendo
start /b "" python server.py --no-browser

:: Esperar 1.5 segundos para que el servidor levante
timeout /t 2 /nobreak >nul

:: Intentar abrir en modo aplicacion de escritorio nativa (Edge o Chrome)
where msedge >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [*] Lanzando interfaz en Microsoft Edge (Modo App)...
    start msedge --app=http://127.0.0.1:8085 --window-size=1280,820
    goto end
)

where chrome >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [*] Lanzando interfaz en Google Chrome (Modo App)...
    start chrome --app=http://127.0.0.1:8085 --window-size=1280,820
    goto end
)

:: Si no estan en PATH, abrir en navegador predeterminado
echo [*] Abriendo en el navegador predeterminado...
start http://127.0.0.1:8085

:end
echo.
echo [OK] AGROEMETA esta activo. Para apagarlo, cierre esta ventana o presione Ctrl+C.
echo.
pause
