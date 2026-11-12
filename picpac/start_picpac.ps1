param([switch]$NoBrowser)
$ErrorActionPreference='Stop'
$picpacRoot=$PSScriptRoot
$picpacUrl='http://127.0.0.1:5174'
try {$picpacHealth=Invoke-RestMethod "$picpacUrl/health" -TimeoutSec 2} catch {$picpacHealth=$null}
if ($picpacHealth.app -eq 'picpac') {
  if ($picpacHealth.api -ne 'track2-1') {throw 'На порту 5174 работает старая версия PicPac. Остановите её перед запуском обновлённой.'}
  Write-Host "PicPac уже работает: $picpacUrl"
  if (-not $NoBrowser) {Start-Process $picpacUrl}
  exit 0
}
$picpacNode=(Get-Command node.exe -ErrorAction Stop).Source
if (-not (Test-Path -LiteralPath (Join-Path $picpacRoot 'dist/index.html'))) {throw 'Не найдена готовая сборка dist. Выполните npm ci и npm run build.'}
$picpacData=Join-Path $picpacRoot '.picpac-data'
New-Item -ItemType Directory -Path $picpacData -Force | Out-Null
$picpacServer=Join-Path $picpacRoot 'server.mjs'
$picpacProcess=Start-Process -FilePath $picpacNode -ArgumentList ('"'+$picpacServer+'"') -WorkingDirectory $picpacRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $picpacData 'launcher.log') -RedirectStandardError (Join-Path $picpacData 'launcher-error.log')
Set-Content -LiteralPath (Join-Path $picpacData 'launcher.pid') -Value $picpacProcess.Id -Encoding ascii
$picpacReady=$false
for ($picpacAttempt=0;$picpacAttempt -lt 50;$picpacAttempt++) {
  $picpacProcess.Refresh()
  if ($picpacProcess.HasExited) {throw 'Сервер завершился. Смотрите .picpac-data/launcher-error.log.'}
  try {$picpacHealth=Invoke-RestMethod "$picpacUrl/health" -TimeoutSec 1;if ($picpacHealth.api -eq 'track2-1') {$picpacReady=$true;break}} catch {}
  Start-Sleep -Milliseconds 100
}
if (-not $picpacReady) {throw 'Не удалось дождаться готовности PicPac.'}
Write-Host "PicPac запущен: $picpacUrl"
if (-not $NoBrowser) {Start-Process $picpacUrl}

