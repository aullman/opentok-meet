@echo off
REM Use this Script with IExpress.exe when generating an OpenTok Plugin Installer for use with Sauce Labs Pre-run Executables
msiexec /i OpenTokPluginMain.msi
echo ^<?xml version="1.0"?^>^<TokBox^>^<DevSel Allow="1"/^>^</TokBox^> > %appdata%\TokBox\OpenTokPluginMain\0.4.0.12\Config\OTConfig.xml
ManyCamSetup.exe /S
