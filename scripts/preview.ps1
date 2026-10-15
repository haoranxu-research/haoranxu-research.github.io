$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
$taskRuby = Join-Path $taskRoot '.local/ruby/bin'
if (Test-Path -LiteralPath (Join-Path $taskRuby 'ruby.exe')) {
    $env:PATH = $taskRuby + ';' + $env:PATH
}
if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
    throw 'Ruby/Bundler is unavailable. See DEPLOYMENT.md for Ruby or Docker setup.'
}
bundle exec jekyll serve --host 127.0.0.1 --port 4000 --no-watch
