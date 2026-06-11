# Informe técnico del proyecto Bajo el Volcán Editorial Literaria

## 1. Introducción

El proyecto Bajo el Volcán Editorial Literaria es un sitio web de carácter editorial y comercial orientado a la presentación de catálogo, autores, noticias institucionales y contacto con lectores. Su estructura está construida para ofrecer una experiencia principalmente informativa, con funcionalidades complementarias de navegación, filtrado de contenido y gestión básica de carrito de compras.

Este informe describe de manera formal su arquitectura, tecnologías empleadas, flujo de funcionamiento y principales módulos de la aplicación.

## 2. Objetivo del sistema

El objetivo principal del sitio es servir como vitrina digital de una editorial literaria independiente. Desde la interfaz se pueden consultar libros, autores, noticias, información institucional, medios de contacto y un flujo de compra asistida mediante WhatsApp o correo electrónico.

## 3. Tecnologías utilizadas

### 3.1 Framework principal

El proyecto está desarrollado con Astro, un framework orientado a contenido y sitios de alto rendimiento. Astro permite generar páginas estáticas a partir de componentes .astro y administrar rutas dinámicas mediante generación estática.

### 3.2 Lenguajes de desarrollo

El proyecto utiliza principalmente los siguientes lenguajes y formatos:

- HTML, dentro de los componentes y páginas de Astro.
- CSS, para estilos globales y estilos específicos por componente.
- JavaScript, para interacción en cliente, filtros, carrito y formularios.
- TypeScript, usado de forma parcial en scripts de Astro para tipado y validación.
- JSON, como fuente de datos para libros, autores, noticias y equipo.

### 3.3 Dependencias relevantes

- Astro: motor de construcción del sitio.
- Bootstrap 5: sistema de rejilla, componentes visuales y utilidades.
- Bootstrap Icons: iconografía de la interfaz.
- AOS: animaciones al hacer scroll o al cargar secciones.
- TypeScript y @astrojs/check: soporte de tipado y validación.

## 4. Arquitectura general

La aplicación está organizada como un sitio estático con renderizado por páginas. No depende de un backend propio ni de una base de datos. El contenido principal se alimenta desde archivos JSON locales y la interacción del usuario se resuelve en el navegador mediante JavaScript.

La estructura funcional se apoya en tres capas:

1. Capa de presentación: páginas y componentes Astro.
2. Capa de datos: archivos JSON con libros, autores, noticias y equipo.
3. Capa de interacción: scripts de cliente para carrito, filtros y formularios.

## 5. Estructura funcional del sitio

### 5.1 Layout global

El archivo principal de estructura es el layout general. Este integra el encabezado superior, la barra de navegación, el contenido central y el pie de página. También carga estilos globales, fuentes, Bootstrap, Bootstrap Icons y AOS.

Además, el layout inicializa datos compartidos para libros y autores, actualiza el contador del carrito y activa las animaciones en cada navegación interna.

### 5.2 Página de inicio

La página principal reúne los bloques más importantes del sitio:

- Sección de premios o avisos destacados.
- Carrusel hero con portadas de libros.
- Sección de catálogo de libros.
- Sección de autores destacados.

El objetivo es presentar de forma visual la identidad editorial y dirigir al usuario hacia el catálogo, el detalle de cada obra y los autores.

### 5.3 Catálogo de libros

El catálogo se compone de una grilla de tarjetas y una barra lateral de categorías. El usuario puede filtrar por etiquetas como nuevos, destacados, preventa y por géneros editoriales.

Cada tarjeta de libro enlaza al detalle individual de la obra. En esa vista se despliega información técnica como precio, ISBN, páginas, editorial, idioma, formato, descripción, frase destacada y autor asociado.

### 5.4 Autores

La sección de autores muestra un resumen de los perfiles y su respectivo detalle individual. Cada autor tiene una página propia generada de forma estática a partir de los datos del archivo JSON.

En esa ruta se presentan la biografía, la fotografía, la nacionalidad y las obras relacionadas con el autor.

### 5.5 Noticias

La sección de noticias funciona como un módulo de actualidad editorial. Las noticias se normalizan en una utilidad central que ordena los registros, genera slugs y clasifica categorías.

La vista principal permite filtrar las noticias por categoría, y cada noticia cuenta con una página individual donde se muestran título, fecha, imagen, resumen, contenido completo y, cuando aplica, enlace a PDF relacionado.

### 5.6 Carrito de compras

El carrito no se gestiona en un servidor, sino directamente en el navegador por medio de localStorage. Esto permite agregar libros, modificar cantidades, vaciar el carrito y revisar el total.

Desde esa misma vista el usuario puede iniciar un proceso de contacto comercial mediante WhatsApp o correo electrónico, construyendo el mensaje con el detalle del pedido.

### 5.7 Contacto y pagos

La página de contacto ofrece canales directos de comunicación. El formulario no se envía a un backend; en su lugar construye un correo electrónico mediante mailto.

La página de pagos presenta un código QR y orienta al usuario para enviar el comprobante por WhatsApp. El flujo está diseñado para facilitar una compra asistida y manual.

## 6. Flujo de funcionamiento

El funcionamiento general puede describirse de la siguiente manera:

1. El usuario entra al sitio y Astro sirve una página estática ya preparada.
2. El layout global monta la navegación y carga los recursos visuales compartidos.
3. Los datos de libros, autores y noticias se leen desde archivos JSON locales.
4. Las páginas dinámicas se generan con rutas estáticas basadas en esos datos.
5. Los scripts en cliente activan filtros, carrito, mensajes y acciones de contacto.
6. El carrito guarda información en el navegador y mantiene el contador visible en la interfaz.
7. El proceso de compra termina fuera del sitio, a través de WhatsApp o correo electrónico.

## 7. Gestión de datos

El proyecto usa datos estructurados en JSON como fuente única para el contenido principal. Este enfoque simplifica mantenimiento, despliegue y edición del catálogo sin necesidad de una base de datos.

Los archivos más importantes son:

- libros.json: catálogo de obras.
- autores.json: información de autores.
- noticias.json: publicaciones y anuncios.
- team.json: equipo institucional.

Adicionalmente, existe una utilidad para noticias que normaliza fechas, slugs y categorías, garantizando consistencia en el renderizado.

## 8. Interacción en cliente

La interactividad del proyecto es ligera y específica:

- Filtrado de libros por categoría.
- Filtrado de noticias por tipo de contenido.
- Agregado y eliminación de productos en el carrito.
- Conteo dinámico de unidades en la barra superior.
- Mensajes de compra preparados para WhatsApp y correo.
- Formulario de contacto con validación básica en navegador.

No se observa una arquitectura SPA completa ni una gestión compleja de estado global en el cliente. La aplicación mantiene una lógica simple, adecuada para un sitio editorial estático.

## 9. Diseño e interfaz

El diseño visual se apoya en variables CSS globales, tipografías de Google Fonts y estilos reutilizables para botones, títulos, divisores y etiquetas. Bootstrap aporta la base responsiva, mientras que los estilos propios consolidan una identidad visual sobria y editorial.

El sitio combina:

- Encabezados con fuerte peso tipográfico.
- Tarjetas de contenido con bordes y sombras suaves.
- Layout responsivo adaptado a escritorio y móvil.
- Navegación fija y elementos de acción visibles.

## 10. Observaciones técnicas

El proyecto está orientado a contenido estático y funciona correctamente para un flujo editorial de consulta y contacto. Su principal fortaleza es la simplicidad de despliegue y la facilidad de mantenimiento mediante JSON.

Como característica técnica relevante, parte de la navegación depende de scripts ejecutados en el navegador y del evento astro:page-load para re-inicializar componentes después de cambios de ruta.

## 11. Conclusión

El sitio Bajo el Volcán Editorial Literaria está construido con Astro como framework principal, usando HTML, CSS, JavaScript, TypeScript y JSON como base tecnológica. Su arquitectura está enfocada en velocidad, sencillez y presentación de contenido, con una separación clara entre datos, presentación e interacción.

Se trata de una solución adecuada para una editorial que necesita exponer catálogo, autores, noticias y canales de contacto sin depender de una infraestructura compleja de servidor o base de datos.