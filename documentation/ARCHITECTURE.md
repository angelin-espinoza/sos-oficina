# Arquitectura de SOS Oficina

## Objetivo

SOS Oficina convierte situaciones habituales de soporte IT en una simulación interactiva. La arquitectura prioriza tres cualidades: ejecución sin servidor obligatorio, contenido técnico mantenible y decisiones explicables.

## Componentes

### Interfaz de simulación

`source/app/page.tsx` controla las tres etapas de la experiencia:

1. centro de respuesta e inicio de guardia;
2. resolución secuencial de incidencias;
3. informe final con puntuación y métricas.

El estado de React mantiene la misión actual, tiempo restante, intentos, respuestas resueltas, puntuación y contexto del asistente.

### Banco de incidencias

`source/app/question-bank.ts` define semillas técnicas y contextos operativos. La combinación genera 500 casos y cada guardia selecciona 50 de forma aleatoria.

Cada incidencia contiene:

- identificador, categoría y severidad;
- persona, dispositivo y descripción;
- evidencia de terminal;
- pista;
- tres posibles actuaciones;
- respuesta correcta y retroalimentación;
- explicación y secuencia recomendada.

### NEXA

NEXA utiliza una base de conocimiento local y normalización de lenguaje para relacionar preguntas con respuestas técnicas. No requiere enviar el texto a un servicio externo.

El test de red solicita tres veces la propia página sin utilizar caché, calcula un tiempo de respuesta medio y consulta la información de conexión expuesta por el navegador cuando está disponible. El resultado es orientativo y no sustituye una herramienta certificada.

### Presentación

`source/app/globals.css` contiene el sistema visual, los puntos de ruptura responsive y el movimiento:

- partículas de red;
- barrido global;
- paquetes en tránsito;
- estados pulsantes;
- ticker operativo;
- panel flotante de NEXA.

Se respeta `prefers-reduced-motion` para reducir animaciones cuando el sistema lo solicita.

## Flujo de datos

```text
Banco de 500 casos
        |
        v
Selección de 50 casos
        |
        v
Estado local de la guardia
        |
        +--> interfaz de incidencia
        +--> puntuación y temporizador
        `--> contexto de NEXA
```

## Publicación

La versión de GitHub Pages se genera con Vite y usa `/sos-oficina/` como ruta base. Los recursos compilados se almacenan en `assets/`; `index.html` actúa como entrada pública.

## Seguridad y privacidad

- no se recopilan credenciales;
- las preguntas escritas en NEXA permanecen en el navegador;
- las direcciones, usuarios y equipos mostrados son ficticios;
- el test de red solo consulta la propia página;
- las actuaciones inseguras se presentan como opciones incorrectas con explicación.
