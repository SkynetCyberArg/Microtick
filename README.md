# Predictor Estadístico de Lotería

Esta aplicación web permite analizar datos históricos de lotería y generar predicciones estadísticas sobre qué números tienen mayor probabilidad de salir en futuros sorteos.

## Características

- **Análisis de frecuencia**: Identifica qué números aparecen con mayor frecuencia en sorteos anteriores.
- **Detección de patrones**: Busca combinaciones de números (pares y tríos) que tienden a aparecer juntos.
- **Análisis de tendencia**: Identifica números "calientes" (frecuentes) y "fríos" (poco frecuentes).
- **Visualización de datos**: Gráficos interactivos para mostrar la frecuencia de cada número.
- **Personalización**: Soporte para diferentes tipos de lotería y configuraciones personalizadas.
- **Carga de archivos**: Posibilidad de cargar datos históricos desde archivos CSV o TXT.

## Cómo usar la aplicación

1. **Selecciona el tipo de lotería**:
   - Lotería Estándar (6 números del 1 al 49)
   - Powerball (5 números principales + 1 número especial)
   - Personalizado (configura tus propios parámetros)

2. **Ingresa datos históricos**:
   - Escribe manualmente los resultados de sorteos anteriores (un sorteo por línea, números separados por espacios)
   - O carga un archivo CSV/TXT con los datos históricos

3. **Analiza y predice**:
   - Haz clic en el botón "Analizar y Predecir" para generar las predicciones
   - Revisa los resultados en la sección de "Resultados de Predicción"

4. **Interpreta los resultados**:
   - **Números predichos**: Conjunto de números con mayor probabilidad estadística
   - **Análisis de frecuencia**: Gráfico que muestra la frecuencia de cada número
   - **Patrones detectados**: Combinaciones de números que suelen aparecer juntos
   - **Estadísticas**: Información general sobre los datos analizados

## Formato de datos

Para ingresar datos históricos manualmente, usa el siguiente formato:

```
1 15 23 34 42 48
7 12 25 30 41 45
3 11 24 36 39 47
```

Cada línea representa un sorteo, con los números separados por espacios.

## Consideraciones importantes

- Esta herramienta se basa en análisis estadístico y no garantiza resultados ganadores.
- La lotería es fundamentalmente un juego de azar donde cada sorteo es independiente de los anteriores.
- Las predicciones deben considerarse como una referencia educativa, no como una estrategia de juego.
- Juega con responsabilidad y establece límites claros para el juego.

## Tecnologías utilizadas

- HTML5, CSS3 y JavaScript
- Bootstrap 5 para el diseño responsivo
- Chart.js para la visualización de datos

## Instalación local

1. Clona o descarga este repositorio
2. Abre el archivo `index.html` en tu navegador web
3. ¡Listo! No se requiere instalación adicional

## Licencia

Este proyecto está disponible como código abierto bajo la licencia MIT. Puedes utilizarlo, modificarlo y distribuirlo libremente, siempre que mantengas la atribución al autor original.

## Descargo de responsabilidad

Esta aplicación ha sido desarrollada con fines educativos y de entretenimiento. No promueve ni fomenta la participación en juegos de azar. El autor no se hace responsable del uso que se dé a esta herramienta ni de las posibles pérdidas económicas derivadas de su uso.