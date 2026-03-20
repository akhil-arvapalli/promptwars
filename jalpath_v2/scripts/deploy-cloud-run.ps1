param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [string]$Region = "asia-south1",
    [string]$Service = "jalpath-v2",

    [string]$GeminiSecretName = "GEMINI_API_KEY",
    [string]$GeminiSecretVersion = "latest"
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

Require-Command -Name "gcloud"

Write-Host "Setting gcloud project: $ProjectId" -ForegroundColor Cyan
gcloud config set project $ProjectId | Out-Host

Write-Host "Enabling required APIs..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com | Out-Host

$secretRef = "GEMINI_API_KEY=${GeminiSecretName}:${GeminiSecretVersion}"

Write-Host "Deploying Cloud Run service: $Service ($Region)" -ForegroundColor Cyan
gcloud run deploy $Service `
    --source . `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --set-secrets $secretRef | Out-Host

$serviceUrl = gcloud run services describe $Service --region $Region --format="value(status.url)"
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host "Service URL: $serviceUrl" -ForegroundColor Green
