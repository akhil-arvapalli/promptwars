param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [string]$Region = "asia-south1",
    [string]$Service = "jalpath-v2",
    [string]$Image = "jalpath-v2",

    [Parameter(Mandatory = $true)]
    [string]$FirebaseApiKey,

    [Parameter(Mandatory = $true)]
    [string]$FirebaseAuthDomain,

    [Parameter(Mandatory = $true)]
    [string]$FirebaseProjectId,

    [Parameter(Mandatory = $true)]
    [string]$FirebaseStorageBucket,

    [Parameter(Mandatory = $true)]
    [string]$FirebaseMessagingSenderId,

    [Parameter(Mandatory = $true)]
    [string]$FirebaseAppId,

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

$imageRef = "gcr.io/$ProjectId/$Image"

Write-Host "Building container image: $imageRef" -ForegroundColor Cyan
gcloud builds submit --tag $imageRef | Out-Host

$envVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY=$FirebaseApiKey",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FirebaseAuthDomain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FirebaseProjectId",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FirebaseStorageBucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FirebaseMessagingSenderId",
    "NEXT_PUBLIC_FIREBASE_APP_ID=$FirebaseAppId"
) -join ","

$secretRef = "GEMINI_API_KEY=${GeminiSecretName}:${GeminiSecretVersion}"

Write-Host "Deploying Cloud Run service: $Service ($Region)" -ForegroundColor Cyan
gcloud run deploy $Service `
  --image $imageRef `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --set-env-vars $envVars `
  --set-secrets $secretRef | Out-Host

$serviceUrl = gcloud run services describe $Service --region $Region --format="value(status.url)"
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host "Service URL: $serviceUrl" -ForegroundColor Green
