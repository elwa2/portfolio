# generate-games-list.ps1
$gamesDir = $PSScriptRoot
$jsonPath = Join-Path $gamesDir "games-list.json"

$games = @()

Get-ChildItem -Path $gamesDir -Filter "*.html" | Where-Object { $_.Name -ne "index.html" } | Sort-Object Name | ForEach-Object {
    $title = $_.BaseName.Replace("-", " ").Replace("_", " ")
    $obj = New-Object PSObject -Property @{
        file  = $_.Name
        title = $title
        desc  = "Play " + $title
    }
    $games += $obj
}

$games | ConvertTo-Json -Depth 3 | Out-File -FilePath $jsonPath -Encoding UTF8

Write-Host "Updated games-list.json" -ForegroundColor Green
Write-Host "Games: $($games.Count)" -ForegroundColor Cyan
