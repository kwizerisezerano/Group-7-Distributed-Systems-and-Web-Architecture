# install-node.ps1 - Try winget first, fall back to downloading Node LTS MSI and running it
Param()

function Run-Installer {
    param($url, $out)
    Write-Host "Downloading $url to $out ..."
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    Write-Host "Launching installer (may request admin rights)..."
    Start-Process -FilePath $out -ArgumentList '/quiet' -Wait -Verb RunAs
}

try {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "winget found - installing Node (LTS)..."
        winget install -e --id OpenJS.NodeJS.LTS
        exit $LASTEXITCODE
    }

    Write-Host "winget not found — downloading Node LTS MSI (x64)..."
    $nodeVersion = '18.20.0'
    $msiUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
    $outFile = Join-Path $env:TEMP "node-v$nodeVersion-x64.msi"
    Run-Installer -url $msiUrl -out $outFile
    Write-Host "Installer finished. Please restart PowerShell and run: node -v ; npm -v"
} catch {
    Write-Error "Install failed: $_"
    exit 1
}
