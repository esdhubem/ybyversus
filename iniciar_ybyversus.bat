@echo off
chcp 65001 > nul
title Ybyversus • Praça Pública Digital
echo ========================================================
echo   🌿 Ybyversus • Praça Pública Digital
echo   Uma infraestrutura de circulação pública de saberes
echo ========================================================
echo.
echo Iniciando servidor local PWA...
start "" http://localhost:3333
node _serve.js
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [Aviso] Node.js não encontrado ou porta ocupada.
  echo Abrindo index.html diretamente no seu navegador...
  start "" index.html
)
pause

