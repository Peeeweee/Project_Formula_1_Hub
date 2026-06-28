$Logos = @(
    @{ Name = "williams.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/7/7e/Williams_Racing_logo_2020.svg" },
    @{ Name = "lotus.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/b/b3/Team_Lotus_logo.svg" },
    @{ Name = "brabham.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/d/db/Brabham_logo.svg" },
    @{ Name = "benetton.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/4/4e/Benetton_Formula_logo.svg" },
    @{ Name = "tyrrell.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/e/ec/Tyrrell_Logo.svg" },
    @{ Name = "cooper.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/b/b5/Cooper_logo.svg" },
    @{ Name = "brm.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/b/b4/British_Racing_Motors_logo.svg" },
    @{ Name = "alpine.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_logo.svg" },
    @{ Name = "sauber.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/f/fb/Sauber_Motorsport_logo.svg" },
    @{ Name = "haas.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/4/4e/Haas_F1_Team_logo.svg" },
    @{ Name = "rb.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/5/5a/Visa_Cash_App_RB_F1_Team_Logo.svg" },
    @{ Name = "brawn.svg"; Url = "https://upload.wikimedia.org/wikipedia/en/4/4c/Brawn_GP_logo.svg" }
)

$OutputDir = ".\public\assets\logos"

foreach ($Logo in $Logos) {
    $FilePath = Join-Path $OutputDir $Logo.Name
    Write-Host "Downloading $($Logo.Name)..." -NoNewline
    try {
        Invoke-WebRequest -Uri $Logo.Url -OutFile $FilePath -UseBasicParsing
        Write-Host " Done!" -ForegroundColor Green
    } catch {
        Write-Host " Failed!" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "All downloads attempted. Check public\assets\logos for the files."
