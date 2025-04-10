@echo off
setlocal

REM === CONFIGURATION ===
set ZIP_URL=https://github.com/21beckem/Becker-Ticketer/archive/refs/heads/main.zip
set ZIP_NAME=extension.zip
set TEMP_DIR=%TEMP%\extension_download
set DESKTOP=%USERPROFILE%\Desktop

REM === PREPARE TEMP DIRECTORY ===
if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

REM === DOWNLOAD ZIP FILE ===
echo Downloading zip file...
powershell -Command "Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%ZIP_NAME%'"

REM === EXTRACT ZIP FILE ===
echo Extracting zip file...
powershell -Command "Expand-Archive -LiteralPath '%ZIP_NAME%' -DestinationPath '.'"

REM === DELETE THE ZIP FILE ===
del "%ZIP_NAME%"

REM === NAVIGATE INTO 'Becker-Ticketer-main' FOLDER ===
if exist "Becker-Ticketer-main" (
    cd /d "Becker-Ticketer-main"
) else (
    echo Becker-Ticketer-main folder not found!
    pause
    exit /b 1
)

REM === DELETE EVERYTHING EXCEPT THE 'extension' FOLDER ===
echo Cleaning up other files and folders...
for /d %%D in (*) do (
    if /I not "%%D"=="extension" rd /s /q "%%D"
)
for %%F in (*) do (
    if /I not "%%F"=="extension" del /q "%%F"
)

REM === MOVE THE 'extension' FOLDER TO DESKTOP ===
echo Moving 'extension' folder to desktop...
move /Y "extension" "%DESKTOP%\extension"

REM === RENAME THE MOVED FOLDER TO 'BeckerTicketerExtension' ===
echo Renaming folder on desktop...
ren "%DESKTOP%\extension" "BeckerTicketerExtension"

REM === CLEANUP TEMP DIRECTORY ===
cd /d %TEMP%
rd /s /q "%TEMP_DIR%"

echo Download and installation complete.

REM === OPEN FILE EXPLORER TO DESKTOP ===
explorer "%DESKTOP%"

exit