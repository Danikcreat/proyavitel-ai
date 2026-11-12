$ErrorActionPreference='Stop'
$picpacPidFile=Join-Path $PSScriptRoot '.picpac-data/launcher.pid'
if (-not (Test-Path -LiteralPath $picpacPidFile)) {Write-Host 'Нет процесса, запущенного этим launcher. При ручном запуске используйте Ctrl+C.';exit 0}
$picpacPid=[int](Get-Content -LiteralPath $picpacPidFile)
$picpacProcess=Get-CimInstance Win32_Process -Filter "ProcessId=$picpacPid"
$picpacServer=Join-Path $PSScriptRoot 'server.mjs'
if ($picpacProcess -and $picpacProcess.Name -eq 'node.exe' -and $picpacProcess.CommandLine.Contains($picpacServer)) {Stop-Process -Id $picpacPid;Write-Host 'PicPac остановлен.'} else {Write-Host 'Указанный процесс не принадлежит этому launcher; он не изменён.'}

