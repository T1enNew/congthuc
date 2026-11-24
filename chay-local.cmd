@echo off
rem Bấm đúp file này để chạy "Sổ tay pha chế" trên máy (cần Node.js 20.19+ : https://nodejs.org).
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Chua cai Node.js. Tai tai https://nodejs.org roi chay lai. & pause & exit /b 1)
if not exist node_modules (
  echo Dang cai thu vien lan dau...
  call npm install || (pause & exit /b 1)
)
call npm run dev -- --open
pause
