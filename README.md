# Invest Smart AI

INVEST IA — Aplicación web/PWA de gestión inteligente de inversiones

Contexto y Rol

Construye una aplicación web/PWA profesional llamada INVEST IA, en español, que funcione como panel personal de control financiero e inversiones asistido por inteligencia artificial.

La aplicación debe estar diseñada desde el principio para poder evolucionar posteriormente hacia una plataforma conectada a datos reales de mercado, MyInvestor y/o brokers con API.

IMPORTANTE: en esta primera versión NO conectar cuentas bancarias, MyInvestor ni brokers reales y NO ejecutar operaciones con dinero real. Toda la información debe utilizar datos ficticios coherentes (mock data), pero la arquitectura debe quedar preparada para sustituir posteriormente los datos ficticios por datos reales mediante APIs.

La aplicación debe ser completamente funcional e interactiva desde el primer momento.

Tecnología y diseño

Utiliza:

React + TypeScript

Tailwind CSS

Shadcn UI

Recharts para gráficos

Diseño responsive

Dark Mode por defecto

Arquitectura modular y escalable

Componentes reutilizables

Iconos Lucide

Navegación mediante rutas

La aplicación debe funcionar perfectamente en:

Escritorio

Tablet

Móvil

En escritorio utilizar una barra lateral fija.

En móvil utilizar una barra de navegación inferior fija.

Identidad visual

Nombre:

INVEST IA

Subtítulo:

Tu asistente inteligente de inversiones

Estética:

Oscura

Elegante

Profesional

Minimalista

Moderna

Similar a una plataforma financiera profesional

Colores principales:

Verde/esmeralda → ganancias, estados positivos

Azul → inteligencia artificial

Amarillo → atención

Rojo → riesgo/alerta

Fondo oscuro

Tarjetas ligeramente contrastadas

Evitar diseños excesivamente llamativos.

NAVEGACIÓN

Crear estas 5 secciones principales:

Dashboard → /

Mi Cartera → /cartera

Asistentes IA → /asistentes

Trading Bot → /trading

Configuración → /configuracion

En escritorio mostrar:

Logo INVEST IA

Dashboard

Mi Cartera

Asistentes IA

Trading Bot

Configuración

En móvil mostrar únicamente las 5 secciones principales en una barra inferior fija.

Mostrar claramente qué sección está activa.

1. DASHBOARD /

Crear un dashboard financiero completo.

Cabecera

Mostrar:

INVEST IA

Selector de estado global:

🟢 Normal

🟡 Atención

🔴 Alerta

Añadir avatar/icono del usuario y acceso a configuración.

Resumen financiero

Mostrar 4 tarjetas:

Patrimonio Total

Ejemplo:

5.850,42 €

Ganancia/Pérdida

Ejemplo:

+382,17 € (+7,00%)

Beneficios Acumulados

Ejemplo:

+512,80 €

Aportaciones

Ejemplo:

5.468,25 €

Evolución del patrimonio

Crear gráfico de línea con Recharts.

Mostrar selector:

1D

1M

1A

Histórico

El gráfico debe cambiar realmente al seleccionar cada periodo utilizando distintos conjuntos de mock data.

Añadir tooltip con:

Fecha

Patrimonio

Variación

Distribución de activos

Crear tarjetas/gráfico de distribución:

Fondos

ETF

Acciones

Oro

Efectivo

Mostrar porcentaje y valor en euros.

Subcarteras MyInvestor

Crear tarjetas independientes:

Cartera Ahorro

Cartera Indie

Dividendos

Oro

Otros

Utilizar datos ficticios coherentes.

Cada tarjeta debe mostrar:

Valor

Rentabilidad

Porcentaje de cartera

Tendencia

Estado de cartera

Crear un componente visual tipo semáforo:

🟢 NORMAL

Texto de ejemplo:

"Tu cartera se encuentra dentro de los parámetros establecidos."

También contemplar los estados:

🟡 ATENCIÓN

🔴 ALERTA

El estado debe poder cambiar mediante los datos mock o desde configuración.

2. MI CARTERA /cartera

Crear una tabla interactiva de posiciones.

Columnas:

Activo

Tipo

Cantidad

Precio medio

Precio actual

Valor actual

Ganancia/Pérdida €

Rentabilidad %

Peso %

Tipos:

Fondo

ETF

Acción

Oro

Efectivo

Utilizar varias posiciones ficticias.

Ejemplos:

Cartera Ahorro

Cartera Indie

Fondo Dividendos

ETF Oro

ETF S&P 500

ETF Nasdaq

Efectivo

Funciones

Añadir:

Buscador

Filtros por tipo

Ordenación por columnas

Indicadores positivos/negativos

Vista responsive

Importar / Actualizar Datos

Crear botón:

Importar / Actualizar Datos

Al pulsarlo abrir un modal.

Opciones:

Importar archivo

Permitir seleccionar:

CSV

XLSX

Excel

En esta primera versión simular la importación y mostrar una previsualización.

Añadir posición manualmente

Formulario:

Nombre

ISIN/ticker

Tipo

Cantidad

Precio medio

Precio actual

Subcartera

Al guardar, añadir la posición a la tabla.

Los cambios deben mantenerse durante la sesión.

3. ASISTENTES IA /asistentes

Crear una interfaz de chat moderna.

En la parte superior permitir seleccionar entre 5 asistentes:

🤖 Rafa IA

Asistente general de cartera.

📊 Analista

Analiza:

S&P 500

Nasdaq

Oro

Bonos

ETF

Fondos

Acciones

🛡️ Vigilante

Detecta:

Volatilidad

Caídas

Riesgos

Concentración

Desviaciones respecto a objetivos

💰 Optimizador

Analiza:

Rebalanceo

Distribución

Nuevas aportaciones

Exposición por activos

🤖 Trader

Analiza señales de mercado en modo simulación.

Chat

Crear:

Campo de mensaje

Botón enviar

Historial de conversación

Avatar del asistente

Indicador de "analizando..."

Respuestas simuladas

Las respuestas deben utilizar inicialmente mock data, pero estructurar el código para que posteriormente pueda conectarse a una API de IA.

Respuestas iniciales

Cada asistente debe tener una conversación de ejemplo coherente.

Por ejemplo Rafa IA:

"Tu cartera presenta actualmente una rentabilidad positiva del 7%. La mayor exposición corresponde a Cartera Indie. El principal punto a vigilar es la exposición al oro."

Analista:

"El oro presenta volatilidad elevada en el periodo analizado..."

Vigilante:

"No se detectan actualmente desviaciones críticas..."

Optimizador:

"Tu asignación actual presenta una desviación del 3% respecto a tus objetivos..."

Trader:

"Se ha detectado una señal simulada sobre el S&P 500..."

4. TRADING BOT /trading

Crear una sección específica para el bot.

Selector de modo

Mostrar tres tarjetas claramente diferenciadas:

🟢 MODO 1 — SIMULACIÓN

ACTIVO

Paper Trading con dinero ficticio.

🟡 MODO 2 — COPILOTO

DISPONIBLE

Genera señales y el usuario decide.

🔴 MODO 3 — AUTOMÁTICO

DESACTIVADO

Mostrar:

"Requiere conexión con un broker/API compatible."

IMPORTANTE:

No ejecutar nunca operaciones reales en esta versión.

Métricas

Mostrar:

Capital simulado

Rendimiento simulado

Win Rate %

Drawdown máximo

Número de operaciones

Beneficio/Pérdida

Utilizar mock data coherente.

Última señal

Crear tarjeta:

S&P 500

🟢 COMPRA

Confianza:

74%

Precio de entrada:

XXXX

Stop-Loss:

XXXX

Take-Profit:

XXXX

Ratio riesgo/beneficio:

1:2

Mostrar fecha y hora de la señal.

Historial de señales

Crear tabla:

Fecha

Activo

Señal

Confianza

Resultado

Estado

Permitir filtrar.

Simulador

Añadir controles:

Capital inicial

Riesgo por operación

Activo

Estrategia

Botón:

Ejecutar simulación

Mostrar resultado ficticio.

5. CONFIGURACIÓN /configuracion

Objetivos de asignación

Crear tabla editable:

CategoríaObjetivoActualDiferenciaCartera Ahorro30%32%+2%Cartera Indie40%38%-2%Oro10%12%+2%Efectivo20%18%-2%

Permitir editar los porcentajes.

Validar que la suma total sea 100%.

Actualizar automáticamente las diferencias.

Notificaciones

Crear switches:

Alertas de cartera

Alertas de caídas importantes

Alertas de oportunidades

Alertas de trading

Email

Push

Mostrar estado activado/desactivado.

MODO DEMO

Crear un modo demo claramente identificado.

Debe permitir al usuario probar:

Dashboard

Cartera

Importación

Añadir posiciones

Asistentes

Trading

Configuración

sin necesidad de conectar ninguna cuenta externa.

ARQUITECTURA FUTURA

Aunque esta versión utilice mock data, organizar el código para poder añadir posteriormente:

Supabase

Autenticación

Base de datos

API de datos financieros

API de inteligencia artificial

Alertas automáticas

Integraciones externas

APIs de brokers

Conexiones autorizadas con plataformas de inversión

Separar claramente:

componentes UI

datos mock

lógica de cartera

lógica de trading

servicios/API

configuración

No mezclar los datos ficticios directamente dentro de los componentes cuando sea posible.

Crear una capa de servicios que permita sustituir posteriormente los mock data por APIs reales.

EXPERIENCIA DE USUARIO

La aplicación debe sentirse como un producto real, no como una maqueta.

Todos los botones importantes deben funcionar.

Los formularios deben validar los datos.

Los gráficos deben responder a los filtros.

Las tablas deben permitir ordenar y filtrar.

Los modales deben abrir y cerrar correctamente.

Los cambios realizados por el usuario deben reflejarse inmediatamente en la interfaz.

Utilizar animaciones sutiles y profesionales.

Añadir estados:

Loading

Empty

Error

Success

cuando corresponda.

SEGURIDAD

No solicitar ni almacenar:

contraseñas bancarias

credenciales de MyInvestor

claves privadas

claves API reales

No ejecutar operaciones financieras reales.

El módulo de trading automático debe aparecer como desactivado y preparado únicamente para una futura integración autorizada con un broker compatible.

RESULTADO FINAL

Entregar una PWA llamada:

INVEST IA

con una experiencia profesional de plataforma de inversión inteligente.

Debe poder utilizarse inmediatamente con datos ficticios y quedar preparada arquitectónicamente para evolucionar posteriormente hacia:

datos reales → IA real → alertas automáticas → paper trading → señales → integración autorizada con broker → trading automatizado.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/324e377c-603e-4a89-a848-e464f7f8df61).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
