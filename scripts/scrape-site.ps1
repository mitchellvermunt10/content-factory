# Scrape een bestaande website voor content-extractie.
# Geeft foto's, openingstijden, services, contactgegevens terug.
#
# Gebruik vanuit project root:
#   powershell -ExecutionPolicy Bypass -File scripts\scrape-site.ps1 https://www.mooigeknipt.nl
#
# Of zonder URL-argument — vraagt dan om input.

param(
    [Parameter(Position = 0)]
    [string]$Url,
    [Parameter(Position = 1)]
    [ValidateSet("salon", "restaurant", "dentist", "gym", "tattoo", "barber", "hotel", "coffeeshop", "autobedrijf")]
    [string]$Vertical = "salon",
    [string]$BusinessName,
    [int]$Port = 3008
)

if (-not $Url) {
    $Url = Read-Host "Welke URL wil je scrapen? (bv. https://www.mooigeknipt.nl)"
}

$bodyHash = @{
    websiteUrl = $Url
    vertical = $Vertical
}
if ($BusinessName) { $bodyHash.businessName = $BusinessName }
$body = $bodyHash | ConvertTo-Json
$uri = "http://localhost:$Port/api/research/scrape-website"

Write-Host ""
Write-Host "Site-scraper" -ForegroundColor Cyan
Write-Host "============"
Write-Host "URL:      $Url"
Write-Host "Vertical: $Vertical"
Write-Host "Endpoint: $uri"
Write-Host ""
Write-Host "Bezig met scrapen (kan 10-30 sec duren)..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60
    Write-Host "GELUKT" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "FOUT:" -ForegroundColor Red
    Write-Host ""
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP status: $statusCode"
    }
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        Write-Host "Server zegt: $($_.ErrorDetails.Message)"
    } else {
        Write-Host "Bericht: $($_.Exception.Message)"
    }
}
