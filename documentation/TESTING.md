# Estrategia de pruebas

## Objetivo

Comprobar que SOS Oficina se comporta como una simulación coherente, que las decisiones técnicas reciben una explicación correcta y que la interfaz sigue siendo utilizable en distintos tamaños de pantalla.

## Pruebas funcionales

| Área | Comprobación | Resultado esperado |
|---|---|---|
| Inicio | Pulsar `Iniciar guardia` | Se abre la misión 1 de 50 |
| Selección | Iniciar dos guardias | Cambia la combinación de casos |
| Temporizador | Iniciar una guardia | Comienza en 30:00 y desciende |
| Respuesta correcta | Elegir la acción recomendada | Suma puntos y muestra resolución |
| Respuesta incorrecta | Elegir una acción insegura | Resta puntos y explica el error |
| Progreso | Completar una misión | Actualiza porcentaje y contador |
| Resultado | Completar la guardia | Muestra puntuación, tiempo y rango |
| Reinicio | Pulsar `Volver a jugar` | Genera una guardia nueva |

## Pruebas de NEXA

Preguntas mínimas:

- ¿Qué es una IP?
- ¿Por qué aparece una dirección 169.254?
- ¿Qué es una máscara de subred?
- ¿Qué es una puerta de enlace?
- ¿Qué es DHCP?
- ¿Cómo se configura una IP en Windows?
- ¿Cómo se configura DHCP?
- ¿Cómo arreglo el Wi-Fi?
- ¿Qué significa NXDOMAIN?
- ¿Qué errores de red son comunes?

También se prueban formulaciones alternativas como `explícame IP`, `dime qué es una IP` y `para qué sirve una IP`.

## Test de red

1. Abrir NEXA.
2. Pulsar `Test de red`.
3. Verificar que aparece un estado de conexión.
4. Confirmar que se muestra latencia aproximada.
5. Comprobar que la velocidad se marca como estimada o no disponible.
6. Verificar que el texto aclara que no es una medición certificada.

## Responsive

Se comprueban los siguientes escenarios:

- escritorio amplio;
- portátil;
- tableta vertical y horizontal;
- teléfono móvil;
- zoom del navegador;
- contenido largo dentro de NEXA.

Los controles deben permanecer visibles, el texto no debe solaparse y la terminal debe conservar su legibilidad.

## Accesibilidad básica

- botones con nombres comprensibles;
- formulario de NEXA asociado a una etiqueta;
- respuesta del asistente anunciada mediante `aria-live`;
- contraste suficiente en estados principales;
- foco visible en campos y controles;
- reducción del movimiento mediante la preferencia del sistema.

## Criterio de aceptación

La versión se considera publicable cuando compila sin errores, las rutas públicas cargan sus recursos, NEXA responde las preguntas principales y no existen solapamientos bloqueantes en escritorio o móvil.
