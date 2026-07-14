@echo off
REM ===========================================================================
REM  Update a PowerScale-Suite bundle from this git clone.
REM  Double-click from inside the clone. It pulls the latest code and copies the
REM  web app into the bundle that START.bat actually runs.
REM
REM  It does NOT touch the AI model or the database (models_gguf\, app\chroma_db\)
REM  -- those are gitignored and stay as they are.
REM
REM  Bundle location: defaults to %USERPROFILE%\Downloads\PowerScale-Suite\PowerScale-Suite
REM  Override by passing the path:  UPDATE-FROM-CLONE.bat "D:\somewhere\PowerScale-Suite"
REM ===========================================================================
setlocal
cd /d "%~dp0"
set "CLONE=%~dp0"
set "BUNDLE=%USERPROFILE%\Downloads\PowerScale-Suite\PowerScale-Suite"
if not "%~1"=="" set "BUNDLE=%~1"

echo.
echo   clone : %CLONE%
echo   bundle: %BUNDLE%
echo.

if not exist "%BUNDLE%\web\" (
  echo [ERROR] No "web" folder under the bundle path above.
  echo Pass the correct bundle path, e.g.:
  echo     UPDATE-FROM-CLONE.bat "C:\path\to\PowerScale-Suite"
  echo.
  pause
  exit /b 1
)

echo [1/2] git pull ...
git pull
if errorlevel 1 echo   (pull failed -- offline? continuing with the local copy)

echo.
echo [2/2] Copying web app into the bundle ...
copy /Y "%CLONE%web\server_local.py" "%BUNDLE%\web\"  >nul && echo   web\server_local.py
copy /Y "%CLONE%web\index.html"      "%BUNDLE%\web\"  >nul && echo   web\index.html
copy /Y "%CLONE%web\insightiq.html"  "%BUNDLE%\web\"  >nul && echo   web\insightiq.html

echo.
echo Done. Restart the bundle's START.bat to pick up the changes.
echo (Model + database unchanged. To also get CLI answers, copy the Qwen .gguf
echo  into %BUNDLE%\models_gguf\ -- see README.)
echo.
pause
endlocal
