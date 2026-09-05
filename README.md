# Karla & Milo — Álbum de recuerdos ♡

Este proyecto tiene dos partes:
- `index.html`: álbum público para Karla.
- `admin.html`: panel privado para que Milo agregue/edite/oculte/elimine recuerdos.
- Supabase: Auth + Postgres + Storage.

## 1) Crear proyecto en Supabase
1. Crea un proyecto en Supabase.
2. En Authentication > Users, crea el usuario que usarás para el panel (email + contraseña).
3. En SQL Editor pega y ejecuta `schema.sql`.
4. En Storage crea un bucket llamado exactamente `album-fotos`. Para este diseño déjalo público porque el álbum público necesita mostrar las fotos.
5. Copia el UUID del usuario creado en Authentication > Users y ejecuta:
   `insert into public.admin_users(user_id) values ('TU-UUID');`
6. En Project Settings > API copia la URL del proyecto y la Publishable Key.

## 2) Configurar el sitio
Copia `config.example.js` como `config.js` y reemplaza:
- `TU-PROYECTO` por la URL de Supabase.
- `TU-PUBLISHABLE-KEY` por tu Publishable Key.

NO uses la `service_role`/secret key en el navegador.

## 3) Probar
Puedes abrir `index.html` y `admin.html` con un servidor local. Para VS Code, una opción sencilla es Live Server.

## 4) Publicar
Sube todo el contenido a un repositorio de GitHub y activa GitHub Pages desde la rama `main`, carpeta `/root`.

La URL pública será algo como:
`https://milopss.github.io/NOMBRE-DEL-REPOSITORIO/`

## 5) Agregar recuerdos
Entra a `/admin.html`, inicia sesión y crea:
- título
- fecha
- lugar opcional
- descripción
- frase opcional
- una o varias fotos
- visible/oculto

Las fotos se suben a Storage y la información se guarda en Postgres.

## Nota de privacidad
El panel está protegido por Supabase Auth + RLS. El álbum público y el bucket de fotos son públicos en esta versión, por lo que cualquiera con acceso al sitio puede ver los recuerdos publicados y las fotos. Si quieres que incluso las fotos sean privadas, hay que cambiar la arquitectura a bucket privado + URLs firmadas/servidor.
