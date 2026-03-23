---
description: Cómo subir cambios a GitHub Pages sin borrar y re-subir todo
---

# Deploy a GitHub Pages

Cada vez que hagas cambios en tu sitio web y quieras actualizar la página en GitHub Pages, solo ejecuta estos 3 comandos en la terminal desde la carpeta `web`:

// turbo-all

## 1. Agregar todos los archivos modificados
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); git add .
```

## 2. Crear un commit con un mensaje describiendo el cambio
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); git commit -m "descripción del cambio"
```
Reemplaza "descripción del cambio" con lo que cambiaste, ejemplo: `git commit -m "corregir stock no disponible"`

## 3. Subir los cambios a GitHub
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); git push
```

¡Eso es todo! En unos segundos tu página en GitHub Pages se actualizará automáticamente.

> **Nota:** El prefijo `$env:Path = ...` es necesario porque PowerShell a veces no detecta Git sin refrescar la variable PATH.
