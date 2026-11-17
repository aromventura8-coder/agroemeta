$WshShell = New-Object -ComObject WScript.Shell
$WorkspacePath = "c:\Users\Ghosy\Desktop\AGROEMETA"
$TargetBatch = Join-Path $WorkspacePath "INICIAR_AGROEMETA.bat"

# 1. Crear en la carpeta actual
$LocalShortcutPath = Join-Path $WorkspacePath "AGROEMETA_DIRECTO.lnk"
$LocalShortcut = $WshShell.CreateShortcut($LocalShortcutPath)
$LocalShortcut.TargetPath = $TargetBatch
$LocalShortcut.WorkingDirectory = $WorkspacePath
$LocalShortcut.Description = "AGROEMETA - Asistente Jarvis AGI de Agronomía y Mecánica Agrícola"
$LocalShortcut.IconLocation = "shell32.dll,220"
$LocalShortcut.Save()
Write-Host "[+] Creado acceso directo local: $LocalShortcutPath"

# 2. Intentar crear en el Escritorio principal
try {
    $DesktopPath = [System.Environment]::GetFolderPath('Desktop')
    $DesktopShortcutPath = Join-Path $DesktopPath "AGROEMETA.lnk"
    $DesktopShortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
    $DesktopShortcut.TargetPath = $TargetBatch
    $DesktopShortcut.WorkingDirectory = $WorkspacePath
    $DesktopShortcut.Description = "AGROEMETA - Asistente Jarvis AGI de Agronomía y Mecánica Agrícola"
    $DesktopShortcut.IconLocation = "shell32.dll,220"
    $DesktopShortcut.Save()
    Write-Host "[+] Creado acceso directo en Escritorio: $DesktopShortcutPath"
} catch {
    Write-Host "[!] El acceso directo principal en el escritorio se generará al ejecutar 'Crear_Acceso_Directo.bat'"
}
