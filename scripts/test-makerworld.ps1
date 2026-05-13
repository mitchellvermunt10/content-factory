# Test MakerWorld scraper met 3 JJ-3D URLs.
# Geen args nodig — gewoon draaien.
#
# Gebruik:
#   powershell -ExecutionPolicy Bypass -File scripts\test-makerworld.ps1

$products = @(
    @{
        url   = "https://makerworld.com/nl/models/2391957-the-north-face-down-jacket-pen-holder"
        price = 12.50
    },
    @{
        url   = "https://makerworld.com/nl/models/2387676-north-face-beanie-desk-organiser"
        price = 14.00
    },
    @{
        url   = "https://makerworld.com/nl/models/1641939-vinograce-voronoi-wine-holder"
        price = 18.00
    }
)

$port = 3008
$uri = "http://localhost:$port/api/sites/import-makerworld"

Write-Host ""
Write-Host "MakerWorld batch-import (3 URLs)" -ForegroundColor Cyan
Write-Host "================================="
Write-Host ""

foreach ($p in $products) {
    Write-Host "Importing: $($p.url)" -ForegroundColor Yellow
    Write-Host "Prijs: EUR $($p.price)"
    Write-Host ""

    $payload = @{
        url        = $p.url
        shopFolder = "jj-3d"
        price      = $p.price
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 120
        Write-Host "GELUKT: $($response.product.title)" -ForegroundColor Green
        Write-Host "  Image: $($response.product.localImagePath)"
        if ($response.product.printTimeMinutes) {
            Write-Host "  Print-tijd: $($response.product.printTimeMinutes) minuten"
        }
        Write-Host ""
        Write-Host "Data entry voor data.ts:" -ForegroundColor Cyan
        $response.dataEntry | ConvertTo-Json -Depth 5
    } catch {
        Write-Host "FOUT:" -ForegroundColor Red
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "n.v.t." }
        Write-Host "HTTP status: $statusCode"

        $serverBody = $null
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $serverBody = $_.ErrorDetails.Message
        } elseif ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $stream.Position = 0
                $reader = New-Object System.IO.StreamReader($stream)
                $serverBody = $reader.ReadToEnd()
            } catch { }
        }
        Write-Host "Server response: $serverBody"
    }
    Write-Host ""
    Write-Host "---" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Klaar." -ForegroundColor Cyan
