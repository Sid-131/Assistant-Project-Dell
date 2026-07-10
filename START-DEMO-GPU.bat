@echo off
setlocal
cd /d "%~dp0"
title PowerScale Assistant - GPU demo

REM ---------------------------------------------------------------------------
REM  For a laptop with an NVIDIA GPU (e.g. RTX 3050 6GB).
REM  Ollama's cuda_v13 runner crashes on Ampere here:
REM      "CUDA error: shared object initialization failed"
REM  Forcing the cuda_v12 runner fixes it. Measured on the RTX 3050:
REM      prefill  1775 tok/s  (CPU was 42)     generation 48 tok/s  (CPU was 9.5)
REM      a full, cited answer comes back in ~12s instead of 2-3 minutes.
REM ---------------------------------------------------------------------------
set OLLAMA_LLM_LIBRARY=cuda_v12

echo.
echo  ============================================================
echo    PowerScale AI Assistant  -  GPU demo  (Ollama + NVIDIA)
echo  ============================================================
echo.
echo  [1/3] Restarting Ollama on the GPU (cuda_v12 runner)...
taskkill /F /IM "ollama app.exe" >nul 2>&1
taskkill /F /IM ollama.exe       >nul 2>&1
start "Ollama (GPU)" /min "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve

echo  [2/3] Waiting for Ollama to come up...
:waitollama
timeout /t 1 /nobreak >nul
curl -s -o nul http://localhost:11434/api/tags
if errorlevel 1 goto waitollama
echo        Ollama is ready.
echo.

echo  [3/3] Starting the web app (loads the RAG engine, ~10 seconds)...
echo.
echo    OneFS WebUI assistant :  http://localhost:8501/
echo    InsightIQ assistant   :  http://localhost:8501/insightiq
echo.
echo    Answers take about 10-15 seconds on the GPU.
echo    If the browser opens before the app is ready, just refresh.
echo    Keep this window open.  Press Ctrl+C to stop.
echo.

start "" http://localhost:8501
"%~dp0venv\Scripts\python.exe" "%~dp0web\server.py"

endlocal
