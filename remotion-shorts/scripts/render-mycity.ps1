# Render "My City" (9:32, 17160 frames) on a Windows PC in resumable pieces, then join, upscale to 1920x1080 and add the sound.
# Run from the remotion-shorts folder:   powershell -ExecutionPolicy Bypass -File scripts\render-mycity.ps1
# Stop any time with Ctrl+C; run it again and it continues with the next missing piece.
# Optional: -Gl swangle (no graphics card), -Conc 2 (more parallel tabs if the PC has RAM to spare).
param([string]$Gl = "angle", [int]$Conc = 1, [int]$Chunk = 1200)
$ErrorActionPreference = "Stop"
$total = 17160
$dir = "out\mycity\parts"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
'{"post":{"dpr":0.6667}}' | Out-File -Encoding ascii "out\mycity\props.json"
for ($a = 0; $a -lt $total; $a += $Chunk) {
  $b = [Math]::Min($a + $Chunk - 1, $total - 1)
  $f = "{0}\p{1:D5}.mp4" -f $dir, $a
  if (Test-Path $f) { Write-Host "piece $a-$b already done"; continue }
  Write-Host ("piece {0}-{1} start {2:HH:mm}" -f $a, $b, (Get-Date))
  npx remotion render src/index.ts MyCity "$f.tmp.mp4" --gl=$Gl --concurrency=$Conc --scale=0.6667 --props=out\mycity\props.json --frames=$a-$b --muted --crf 16
  if ($LASTEXITCODE -ne 0) { Write-Host "piece $a failed - run the script again to retry"; exit 1 }
  Move-Item "$f.tmp.mp4" $f
}
Get-ChildItem "$dir\p*.mp4" | Sort-Object Name | ForEach-Object { "file '$($_.FullName)'" } | Out-File -Encoding ascii "$dir\list.txt"
npx remotion ffmpeg -y -f concat -safe 0 -i "$dir\list.txt" -i public\mycity\mix.mp3 -map 0:v:0 -map 1:a:0 -vf scale=1920:1080:flags=lanczos -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out\mycity\MyCity_1080p.mp4
Write-Host "FERTIG: out\mycity\MyCity_1080p.mp4"
