---
description: Cómo subir cambios a GitHub Pages sin borrar y re-subir todo
---

# Deploy a GitHub Pages

Cada vez que hagas cambios en tu sitio web y quieras actualizar la página en GitHub Pages, solo ejecuta estos 3 comandos en la terminal desde la carpeta `web`:

// turbo-all

## 1. Agregar todos los archivos modificados
```
git add .
```

## 2. Crear un commit con un mensaje describiendo el cambio
```
git commit -m "descripción del cambio"
```
Reemplaza "descripción del cambio" con lo que cambiaste, ejemplo: `git commit -m "corregir stock no disponible"`

## 3. Subir los cambios a GitHub
```
git push
```

¡Eso es todo! En unos segundos tu página en GitHub Pages se actualizará automáticamente.

---

## Primera vez (configuración inicial)

Si es la primera vez que configuras el repositorio, necesitas ejecutar estos comandos primero:

```
git init
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git branch -M main
git add .
git commit -m "primer commit"
git push -u origin main
```
