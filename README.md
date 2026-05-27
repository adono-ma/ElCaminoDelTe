[Proyecto original/readme.md](https://github.com/ieszayas/pr-ctica-5-3-creaci-n-y-consumo-de-apis-en-una-web-din-mica-adono-ma/blob/c9374d32cb0310aa2cb3c984a6b9ff010e742d99/Parte4/readme.md)

# Mejoras añadidas al proyecto "El Camino del Té" tras la integración del agente de Agentforce

## Descripción general

Se ha incorporado un agente "chat" de Salesforce Agentforce en la web pública de **El Camino del Té**, sitio web publicado en GitHub Pages. Esta integración se ha realizado mediante **Messaging for In-App and Web / Enhanced Web Chat**, usando un *Embedded Service Deployment* específico y el *code snippet* generado desde Salesforce para insertarlo en la página HTML pública.

El agente es capaz de mantener una conversación en español o inglés, dependiendo del idioma utilizado por el usuario.

<img width="390" height="585" alt="Agente chat" src="https://github.com/user-attachments/assets/018264c5-8fb4-4d07-b382-68837647d05d" />

Además, si durante la conversación, el usuario solicita más información, se le envía un email de bienvenida y, si se cumplen ciertos parámetros, también envía un email al equipo comercial para que se pongan en contacto con el posible cliente.


<img width="422" height="446" alt="Correo interno" src="https://github.com/user-attachments/assets/03e55247-2e60-4e6b-a751-ffae9dac6466" />

<img width="1504" height="662" alt="Bienvenida" src="https://github.com/user-attachments/assets/d9015671-ad09-4327-bf9c-0a40bb3d282d" />


La publicación en GitHub Pages permite disponer de una URL pública servida por HTTPS, requisito indispensable durante las pruebas del agente en un sitio externo. GitHub Pages ofrece hosting estático con HTTPS para repositorios y resulta muy útil para publicar una web HTML/CSS/JS de forma sencilla como la de este proyecto.

## Mejoras funcionales incorporadas

### Integración del agente en la página web

Se ha añadido un agente de Agentforce accesible desde la web pública, permitiendo al usuario iniciar una conversación directamente desde la interfaz del sitio. Esta integración se ha implementado con el snippet oficial del deployment de Salesforce, compuesto por la llamada a `embeddedservice_bootstrap.init(...)` y la carga del archivo `bootstrap.min.js` asociado al deployment web.

La solución final hizo uso de un nuevo deployment, vinculado al dominio público publicado en GitHub Pages, para evitar conflictos con configuraciones previas, ligadas a otros dominios. Salesforce requiere conectar el canal de mensajería con el sitio web correcto, ajustar el dominio del deployment y volver a publicarlo para que los cambios surtan efecto.
### Publicación de la web en GitHub Pages

Se ha migrado la fase de pruebas desde el entorno local a GitHub Pages para disponer de un entorno HTTPS estable y accesible públicamente, puesto que Salesforce exige configurar correctamente el origen externo cuando se integra Messaging for Web en un sitio ajeno a Salesforce, haciendo de la conexión desde un archivo local mucho más complicada.

La URL pública del proyecto ha pasado a ser la versión publicada desde el repositorio del sitio, lo que permite validar el comportamiento del agente en un contexto real de navegación. En entornos de prueba con GitHub Pages, Salesforce recomienda usar el dominio publicado como origen permitido dentro de la configuración de seguridad correspondiente.
### Ajustes de seguridad y dominios confiables

Para que el agente funcionara en una web externa, ha sido necesario configurar los dominios y políticas de seguridad relacionadas con el deployment. En particular, Salesforce requiere revisar el dominio del deployment, la lista CORS y los dominios de confianza cuando se usa Messaging for Web con dominios externos o tras cambios de dominio asociados a *Enhanced Domains*.
También se ha alineado el deployment con el dominio correcto del sitio externo y republicarlo después de los cambios debido a exigencias del despliegue de Salesforce para que la configuración nueva se refleje en el widget cargado en la web.
### Resolución de incidencias de integración

Durante el proceso se han resuelto varias incidencias técnicas relacionadas con la carga del widget, los dominios permitidos y la visualización del agente. Entre ellas destacan errores por uso de URLs incorrectas del deployment, problemas de CORS con orígenes no aceptados, limitaciones al probar en local sin HTTPS y políticas CSP asociadas a dominios anteriores usados en otros despliegues.
La solución final ha consistido en generar un despliegue específico para GitHub Pages, asociarlo al dominio correcto y validar el flujo completo de carga del agente en producción. Este enfoque es coherente con la documentación y con ejemplos prácticos de despliegue de Messaging for Web sobre sitios estáticos publicados en GitHub.

## Mejoras de configuración y experiencia de uso

### Personalización visual del chat

Tras lograr la integración funcional, se valoró la posibilidad de adaptar el branding del chat para que encajara mejor con la identidad visual de "El Camino del Té". Salesforce permite personalizar distintos elementos visuales del chat mejorado, como colores y apariencia del botón, desde la configuración de branding del deployment. Sin embargo, no se han llevado a cabo dichos cambios por cuestiones de accesibilidad.

Este ajuste abre la puerta a futuras mejoras como diferenciar visualmente el widget entre modo claro y modo oscuro o incluso mantener deployments distintos para cada variante visual. La plataforma contempla opciones de personalización del chat, aunque ciertos comportamientos avanzados dependen de las capacidades del deployment y del canal de mensajería.

### Revisión de accesibilidad

La integración del widget también motivó una revisión de accesibilidad, detectando algunos avisos vinculados al contenido embebido dentro del iframe del chat. Parte de estos avisos proceden del propio componente generado por Salesforce, mientras que otros pudieron solventarse revisando parámetros como el idioma configurado o el comportamiento del contenido embebido.

En concreto, los códigos de idioma deben usar etiquetas válidas según BCP 47, como `es-ES` o `en-US`, en lugar de formatos con guion bajo.

<img width="464" height="856" alt="problemas de accesibilidad" src="https://github.com/user-attachments/assets/e2830c0e-398b-49d1-8d42-19db1ccc7a40" />


### Gestión del envío de archivos

Dentro de la configuración del agente también se ha eliminado la opción de permitir la subida de archivos por parte del usuario. Salesforce dispone de una configuración específica para impedir que los usuarios finales envíen adjuntos en Enhanced Chat, lo que permite desactivar el icono de clip si el caso de uso del proyecto no requiere ese tipo de interacción. Este botón se intercambió por el de iconos en el chat.

## Mejoras previstas o relacionadas

### Captura de leads desde la web

Como ampliación funcional ligada a la web pública, se plantea el guardado de los datos del formulario de suscripción directamente en Salesforce. Para ello se valora el uso de **Web-to-Lead**, funcionalidad nativa de Salesforce que permite generar un formulario HTML que crea registros de tipo Lead a partir de envíos realizados desde un sitio web externo.

Esta mejora facilitaría conectar la captación de personas interesadas con Salesforce sin necesidad de construir una API personalizada para los casos más sencillos. Además, Salesforce permite incluir campos ocultos, URL de retorno y campos personalizados dentro del formulario Web-to-Lead generado.

## Impacto en el proyecto

La incorporación del agente de Agentforce supone una mejora significativa en la capa de interacción del sitio web, al permitir asistencia conversacional directa desde la propia página pública. Esto convierte "El Camino del Té" en una experiencia más interactiva, conectando contenido informativo y atención automatizada desde una misma interfaz.

Además, la publicación en GitHub Pages y la resolución de incidencias de despliegue, seguridad y accesibilidad consolidan una arquitectura funcional para exponer el agente en un entorno real. El resultado es una base técnica reutilizable para futuras ampliaciones del proyecto, como personalización visual avanzada, mejoras de accesibilidad y captación de leads integrada con Salesforce.


## Notas adicionales

Cabe mencionar que el resto de widgets siguen apoyándose en mockoon para funcionar.
