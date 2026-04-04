param(
  [string]$SeedPath = "private\\private-profile.seed.json",
  [string]$BaseUrl = "https://jasonliao-pages.pages.dev",
  [string]$Username = "jason",
  [string]$Password
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ImageDataUrl {
  param([string]$Path)

  if(-not $Path){
    return ""
  }

  if(-not (Test-Path -LiteralPath $Path)){
    throw "Image not found: $Path"
  }

  $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()

  if($extension -notin @(".png", ".jpg", ".jpeg", ".heic", ".webp")){
    throw "Unsupported image type: $extension"
  }

  Add-Type -AssemblyName PresentationCore
  $bitmap = New-Object System.Windows.Media.Imaging.BitmapImage
  $resolvedPath = (Resolve-Path -LiteralPath $Path).Path
  $bitmap.BeginInit()
  $bitmap.UriSource = [Uri]$resolvedPath
  $bitmap.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
  $bitmap.EndInit()

  $maxLongEdge = 1400
  $longEdge = [Math]::Max($bitmap.PixelWidth, $bitmap.PixelHeight)
  $scale = [Math]::Min(1.0, $maxLongEdge / [double]$longEdge)
  $frameSource = $bitmap

  if($scale -lt 0.999){
    Add-Type -AssemblyName PresentationCore
    $transform = New-Object System.Windows.Media.ScaleTransform($scale, $scale)
    $scaled = New-Object System.Windows.Media.Imaging.TransformedBitmap($bitmap, $transform)
    $frameSource = $scaled
  }

  $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
  $encoder.QualityLevel = 84
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($frameSource))
  $stream = New-Object System.IO.MemoryStream
  $encoder.Save($stream)
  $bytes = $stream.ToArray()
  $stream.Dispose()
  return "data:image/jpeg;base64,$([Convert]::ToBase64String($bytes))"
}

if(-not (Test-Path -LiteralPath $SeedPath)){
  throw "Seed file not found: $SeedPath"
}

$seed = Get-Content -LiteralPath $SeedPath -Raw -Encoding UTF8 | ConvertFrom-Json

if(-not $seed.profile){
  throw "Seed file must include a top-level 'profile' object."
}

$profile = $seed.profile

if($profile.images.primary.filePath){
  $primaryDataUrl = Get-ImageDataUrl -Path $profile.images.primary.filePath
  if($profile.images.primary.PSObject.Properties.Match("dataUrl").Count){
    $profile.images.primary.dataUrl = $primaryDataUrl
  } else {
    $profile.images.primary | Add-Member -NotePropertyName dataUrl -NotePropertyValue $primaryDataUrl
  }
}

if($profile.images.secondary.filePath){
  $secondaryDataUrl = Get-ImageDataUrl -Path $profile.images.secondary.filePath
  if($profile.images.secondary.PSObject.Properties.Match("dataUrl").Count){
    $profile.images.secondary.dataUrl = $secondaryDataUrl
  } else {
    $profile.images.secondary | Add-Member -NotePropertyName dataUrl -NotePropertyValue $secondaryDataUrl
  }
}

if($profile.images.primary.PSObject.Properties.Match("filePath").Count){
  $profile.images.primary.PSObject.Properties.Remove("filePath")
}

if($profile.images.secondary.PSObject.Properties.Match("filePath").Count){
  $profile.images.secondary.PSObject.Properties.Remove("filePath")
}

if(-not $Password){
  $securePassword = Read-Host "Studio admin password" -AsSecureString
  $passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  try {
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
  }
}

$loginBody = @{
  username = $Username
  password = $Password
} | ConvertTo-Json -Compress

Write-Host "Signing in to Studio..."
$loginResponse = Invoke-WebRequest `
  -Uri "$BaseUrl/api/admin/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $loginBody `
  -SessionVariable studioSession `
  -UseBasicParsing

if($loginResponse.StatusCode -lt 200 -or $loginResponse.StatusCode -ge 300){
  throw "Studio login failed with status $($loginResponse.StatusCode)"
}

$profileBody = @{
  profile = $profile
} | ConvertTo-Json -Depth 100 -Compress

Write-Host "Uploading current private profile..."
Invoke-WebRequest `
  -Uri "$BaseUrl/api/admin/private-profile" `
  -Method Put `
  -ContentType "application/json" `
  -Body $profileBody `
  -WebSession $studioSession `
  -UseBasicParsing | Out-Null

Write-Host "Saving private reset default..."
Invoke-WebRequest `
  -Uri "$BaseUrl/api/admin/private-profile-default" `
  -Method Put `
  -ContentType "application/json" `
  -Body $profileBody `
  -WebSession $studioSession `
  -UseBasicParsing | Out-Null

Write-Host "Private profile and reset default updated through Studio API."
