# Kling 3.0 cinematic dolly-in generator voor Next Level Sites.
# Roept /api/sites/generate-video aan op de lokale dev-server,
# print de volledige response of een nette foutmelding.
#
# Aanroepen vanuit project root:
#   powershell -ExecutionPolicy Bypass -File scripts\generate-kling.ps1
#
# Optioneel argument: een andere port dan 3008
#   powershell -ExecutionPolicy Bypass -File scripts\generate-kling.ps1 3007

param(
    [int]$Port = 3008,
    [string]$Folder = "italian-restaurant",
    [string]$Scene = "intro"
)

$uri = "http://localhost:$Port/api/sites/generate-video"

$prompt = "Cinematic slow dolly-in through the open wooden doorway of a warm intimate Italian trattoria at dusk. Camera glides forward at walking pace on a smooth gimbal, completely steady, no shake, no zoom, no rotation, no panning. Anamorphic 2.39:1 widescreen aesthetic with subtle lens flares from interior tungsten lights. Reveal of candlelit interior: exposed brick walls, hanging Edison bulbs casting golden pools of light, dark wooden tables with white linen tablecloths, bottles of wine on shelves. Roger Deakins atmospheric lighting with deep shadows and warm amber highlights. Shallow depth of field with creamy bokeh background. Subtle ambient motion only: candle flames gently flicker, dust particles drift slowly in light beams. Photorealistic, shot on Arri Alexa, 35mm anamorphic prime lens, film grain. No people walking, no shadows crossing frame, no zoom artifacts."

$payload = @{
    folder   = $Folder
    scene    = $Scene
    imageUrl = "/sites/$Folder/exterior.jpg"
    prompt   = $prompt
    duration = 5
    fps      = 24
    maxWidth = 2400
    quality  = 3
}

$body = $payload | ConvertTo-Json

Write-Host ""
Write-Host "Kling 3.0 dolly-in generator" -ForegroundColor Cyan
Write-Host "================================"
Write-Host "Endpoint: $uri"
Write-Host "Folder:   $Folder"
Write-Host "Scene:    $Scene"
Write-Host "Duur:     5 sec (kost ~`$0.42)"
Write-Host "Kwaliteit: PREMIUM (24fps, 2400px, JPG q=3)"
Write-Host ""
Write-Host "Request gaat de deur uit. Wacht 60-90 seconden tot Kling klaar is..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType "application/json" -TimeoutSec 240
    Write-Host "GELUKT" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Refresh nu: http://localhost:$Port/sites/trattoria-sole" -ForegroundColor Green
} catch {
    Write-Host "FOUT:" -ForegroundColor Red
    Write-Host ""
    $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "n.v.t." }
    Write-Host "HTTP status: $statusCode"
    Write-Host ""

    # Probeer de response body uit te lezen — daar zit de echte foutmelding
    $serverBody = $null
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        $serverBody = $_.ErrorDetails.Message
    } elseif ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $stream.Position = 0
            $reader = New-Object System.IO.StreamReader($stream)
            $serverBody = $reader.ReadToEnd()
        } catch {
            $serverBody = "(kon response stream niet lezen)"
        }
    }
    Write-Host "Server response body:" -ForegroundColor Yellow
    Write-Host $serverBody
    Write-Host ""
    Write-Host "Exception message: $($_.Exception.Message)"
}
