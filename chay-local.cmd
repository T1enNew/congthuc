@echo off
rem Bấm đúp file này để chạy "Sổ tay pha chế" trên máy (cần cài Node.js: https://nodejs.org).
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Chua cai Node.js. Tai tai https://nodejs.org roi chay lai. & pause & exit /b 1)
start "" http://localhost:5173
node scripts\serve.mjs 5173
pause
