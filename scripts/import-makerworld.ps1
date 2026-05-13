# Import één MakerWorld product naar JJ-3D shop.
# Scrapet de MakerWorld URL, downloadt primary-image lokaal, geeft
# klaar-om-te-plakken data.ts entry terug.
#
# Gebruik:
#   powershell -ExecutionPolicy Bypass -File scripts\import-makerworld.ps1 "<URL>" <PRIJS>
#
# Voorbeeld:
#   powershell -ExecutionPolicy Bypass -File scripts\import-makerworld.ps1 `
#     "https://makerworld.com/nl/models/2391957-the-north-face-down-jacket-pen-holder" 12.50

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$Url,
    [Parameter(Position = 1, Mandatory = $true)]
    [double]$Price,
    [string]$ShopFolder = "jj-3d",
    [int]$Port = 3008
)

$payload = @{
    url        = $Url
    shopFolder = $ShopFolder
    price      = $Price
} | ConvertTo-Json

$uri = "http://localhost:$Port/api/sites/import-makerworld"

Write-Host ""
Write-Host "MakerWorld product-import" -ForegroundColor Cyan
Write-Host "========================="
Write-Host "URL:    $Url"
Write-Host "Prijs:  EUR $Price"
Write-Host "Shop:   $ShopFolder"
Write-Host ""
Write-Host "Scraping en image-download bezig..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 90
    Write-Host "GELUKT" -ForegroundColor Green
    Write-Host ""
    Write-Host "Product gevonden:"
    Write-Host "  Titel: $($response.product.title)"
    Write-Host "  Image: $($response.product.localImagePath)"
    if ($response.product.printTimeMinutes) {
        Write-Host "  Print-tijd: $($response.product.printTimeMinutes) minuten"
    }
    Write-Host ""
    Write-Host "Plak deze entry in lib/sites/data.ts onder jj-3d.shop.products:" -ForegroundColor Cyan
    Write-Host ""
    $response.dataEntry | ConvertTo-Json -Depth 5
} catch {
    Write-Host "FOUT:" -ForegroundColor Red
    Write-Host ""
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        Write-Host "Server zegt: $($_.ErrorDetails.Message)"
    } else {
        Write-Host "Bericht: $($_.Exception.Message)"
    }
}
