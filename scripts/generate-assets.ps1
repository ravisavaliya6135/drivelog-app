# Generates DriveHours brand assets: PWA icons, apple-touch-icon, favicon.ico, og-image.png
# Design: Navy #0F172A bg, Teal #0D9488 steering wheel mark
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..\public'
$navy = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)
$teal = [System.Drawing.Color]::FromArgb(255, 13, 148, 136)
$slate = [System.Drawing.Color]::FromArgb(255, 148, 163, 184)

function New-SteeringWheelBitmap {
  param([int]$Size)

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear($navy)

  $cx = [float]($Size / 2)
  $cy = [float]($Size / 2)

  # Outer ring
  $ringWidth = $Size * 0.085
  $pad = $Size * 0.17
  $d = $Size - (2 * $pad)
  $ringPen = New-Object System.Drawing.Pen($teal, [float]$ringWidth)
  $g.DrawEllipse($ringPen, [float]$pad, [float]$pad, [float]$d, [float]$d)

  # Spokes: left, right, down (3-spoke wheel)
  $spokePen = New-Object System.Drawing.Pen($teal, [float]($Size * 0.07))
  $spokePen.StartCap = 'Round'
  $spokePen.EndCap = 'Round'
  $hubR = $Size * 0.10
  $rimInner = ($d / 2) - ($ringWidth * 0.6)
  # horizontal spokes
  $g.DrawLine($spokePen, ($cx - $rimInner), $cy, ($cx - $hubR * 0.7), $cy)
  $g.DrawLine($spokePen, ($cx + $hubR * 0.7), $cy, ($cx + $rimInner), $cy)
  # bottom spoke
  $g.DrawLine($spokePen, $cx, ($cy + $hubR * 0.7), $cx, ($cy + $rimInner))

  # Center hub
  $hubBrush = New-Object System.Drawing.SolidBrush($teal)
  $g.FillEllipse($hubBrush, ($cx - $hubR), ($cy - $hubR), ($hubR * 2), ($hubR * 2))
  # hub dot (navy) for depth
  $dotBrush = New-Object System.Drawing.SolidBrush($navy)
  $dotR = $Size * 0.035
  $g.FillEllipse($dotBrush, ($cx - $dotR), ($cy - $dotR), ($dotR * 2), ($dotR * 2))

  $g.Dispose()
  return $bmp
}

# --- PWA icons ---
foreach ($size in @(192, 512)) {
  $bmp = New-SteeringWheelBitmap -Size $size
  $outPath = Join-Path $root ('pwa-{0}x{0}.png' -f $size)
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output "$('pwa-{0}x{0}.png' -f $size) written"
}

# --- Apple touch icon 180x180 ---
$apple = New-SteeringWheelBitmap -Size 180
$apple.Save((Join-Path $root 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "apple-touch-icon.png written"

# --- favicon.ico (PNG-compressed 48x48 inside ICO container) ---
$fav = New-SteeringWheelBitmap -Size 48
$pngStream = New-Object System.IO.MemoryStream
$fav.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $pngStream.ToArray()

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)
$bw.Write([uint16]0)      # reserved
$bw.Write([uint16]1)      # type: icon
$bw.Write([uint16]1)      # count
$bw.Write([byte]48)       # width
$bw.Write([byte]48)       # height
$bw.Write([byte]0)        # palette
$bw.Write([byte]0)        # reserved
$bw.Write([uint16]1)      # planes
$bw.Write([uint16]32)     # bpp
$bw.Write([uint32]$pngBytes.Length)
$bw.Write([uint32]22)     # data offset
$bw.Write($pngBytes)
[System.IO.File]::WriteAllBytes((Join-Path $root 'favicon.ico'), $ms.ToArray())
Write-Output "favicon.ico written"

# --- Open Graph image 1200x630 ---
$og = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear($navy)

# Teal accent bar along top
$tealBrush = New-Object System.Drawing.SolidBrush($teal)
$g.FillRectangle($tealBrush, 0, 0, 1200, 14)

# Mini steering wheel mark, right side
$markBmp = New-SteeringWheelBitmap -Size 340
$g.DrawImage($markBmp, 800, 150, 300, 300)

# Headline
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$fontHead = New-Object System.Drawing.Font('Segoe UI', 76, [System.Drawing.FontStyle]::Bold)
$g.DrawString('DriveHours', $fontHead, $whiteBrush, [float]90, [float]170)

# Subtitle lines
$slateBrush = New-Object System.Drawing.SolidBrush($slate)
$fontSub = New-Object System.Drawing.Font('Segoe UI', 34, [System.Drawing.FontStyle]::Regular)
$g.DrawString('Supervised Driving Log', $fontSub, $slateBrush, [float]95, [float]320)
$g.DrawString('& Legal Sunset Detection', $fontSub, $slateBrush, [float]95, [float]380)

# Teal pill badge
$badgeFont = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Bold)
$badgeText = 'DMV-ready PDF export'
$fmt = New-Object System.Drawing.StringFormat
$measure = $g.MeasureString($badgeText, $badgeFont)
$badgeX = 95; $badgeY = 470; $badgeH = 74
$badgeW = [int]($measure.Width + 60)
$badgePath = New-Object System.Drawing.Drawing2D.GraphicsPath
$badgeRect = New-Object System.Drawing.Rectangle($badgeX, $badgeY, $badgeW, $badgeH)
$r = 37
$badgePath.AddArc($badgeRect.X, $badgeRect.Y, 2*$r, $badgeRect.Height, 180, 180)
$badgePath.AddArc(($badgeRect.Right - 2*$r), $badgeRect.Y, 2*$r, $badgeRect.Height, 270, 180)
$badgePath.AddArc(($badgeRect.Right - 2*$r), ($badgeRect.Bottom - $badgeRect.Height), 2*$r, $badgeRect.Height, 0, 180)
$badgePath.AddArc($badgeRect.X, ($badgeRect.Bottom - $badgeRect.Height), 2*$r, $badgeRect.Height, 90, 180)
$badgePath.CloseFigure()
$g.FillPath($tealBrush, $badgePath)
$whiteFmt = New-Object System.Drawing.StringFormat
$whiteFmt.Alignment = 'Center'
$whiteFmt.LineAlignment = 'Center'
$g.DrawString($badgeText, $badgeFont, $whiteBrush, ([System.Drawing.RectangleF]$badgeRect), $whiteFmt)

$g.Dispose()
$og.Save((Join-Path $root 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "og-image.png written"
