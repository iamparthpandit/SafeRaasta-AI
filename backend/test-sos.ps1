# Test SOS Endpoint
$body = @{
    userName = "Test User"
    latitude = 19.0760
    longitude = 72.8777
    timestamp = "2026-01-23T03:12:00.000Z"
    contacts = @(
        @{
            name = "Mom"
            phone = "+919812345678"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Testing SOS endpoint..." -ForegroundColor Cyan
Write-Host "Request body:" -ForegroundColor Yellow
Write-Host $body

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/sos-trigger" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "`nResponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}
