# Get current local IPv4 address
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi", "Ethernet" | Where-Object { $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "Could not detect local IP address. Please check your network connection." -ForegroundColor Red
    exit
}

Write-Host "Detected current IP: $ip" -ForegroundColor Cyan

# Files to update
$frontendEnvs = @(
    "patient-app/.env.local",
    "therapist-app/.env.local",
    "admin-panel/.env.local"
)

$backendEnv = "backend/.env"
$nextConfigs = @(
    "patient-app/next.config.ts",
    "therapist-app/next.config.ts",
    "admin-panel/next.config.ts"
)

# 1. Update Frontend .env.local
foreach ($file in $frontendEnvs) {
    if (Test-Path $file) {
        Write-Host "Updating $file..."
        $content = Get-Content $file
        $newContent = $content -replace "NEXT_PUBLIC_BACKEND_URL=http://.*:5000", "NEXT_PUBLIC_BACKEND_URL=http://$($ip):5000"
        $newContent | Set-Content $file
    }
}

# 2. Update Backend .env (ALLOWED_ORIGINS)
if (Test-Path $backendEnv) {
    Write-Host "Updating $backendEnv..."
    $content = Get-Content $backendEnv
    # Build the new allowed origins string
    $origins = "http://localhost:3000,http://localhost:3001,http://localhost:3002," + `
               "http://$($ip):3000,http://$($ip):3001,http://$($ip):3002," + `
               "http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002"
    
    $newContent = $content -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=$origins"
    $newContent | Set-Content $backendEnv
}

# 3. Update next.config.ts (allowedDevOrigins)
foreach ($file in $nextConfigs) {
    if (Test-Path $file) {
        Write-Host "Updating $file..."
        $content = Get-Content $file
        $newContent = $content -replace "allowedDevOrigins: \[.*\],", "allowedDevOrigins: ['localhost', '127.0.0.1', '$ip', '192.168.1.34', '192.168.1.40'],"
        $newContent | Set-Content $file
    }
}

Write-Host "Successfully updated IP configuration to $ip" -ForegroundColor Green
Write-Host "Please restart your dev servers for changes to take effect." -ForegroundColor Yellow
