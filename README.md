# Golytics — Agente de IA para análisis de apuestas deportivas

Agente de IA que analiza partidos de fútbol en tiempo real: decide por sí mismo qué
datos consultar (forma reciente de los equipos, cuotas de múltiples casas de
apuestas), y calcula el **valor esperado** real de una apuesta comparando su propia
estimación de probabilidad contra la probabilidad implícita del mercado.

No es un predictor de resultados ni un formulario con IA pegada encima — es un
**agente con tool calling**: el modelo decide qué herramientas usar, en qué orden, y
razona sobre los resultados que va obteniendo, mostrando cada paso en tiempo real.

> ⚠️ Herramienta analítica/educativa. No constituye asesoría de apuestas.

---

## Índice

- [Qué lo hace distinto](#qué-lo-hace-distinto)
- [Arquitectura](#arquitectura)
- [Stack técnico](#stack-técnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Decisiones técnicas destacadas](#decisiones-técnicas-destacadas)

---

## Qué lo hace distinto

- **Razonamiento transparente** — el frontend muestra en tiempo real (streaming SSE)
  cada herramienta que el agente decide llamar y su resultado, no solo un output
  final de caja negra.
- **Datos reales, no inventados** — cada dato del análisis viene de una API
  verificable. El agente tiene instrucciones explícitas de nunca completar campos
  faltantes con información inventada, con 3 capas de defensa (reintentos, prompt
  reforzado, validación defensiva en código) — ver [Decisiones técnicas](#decisiones-técnicas-destacadas).
- **Valor esperado calculado, no opinado** — el EV se calcula con una herramienta
  determinística (no el LLM "haciendo cuentas de cabeza"), comparando probabilidad
  estimada vs. cuota real del mercado.
- **Historial persistente** — cada análisis queda guardado y consultable después,
  scopeado por sesión de navegador (sin sistema de login).

---

## Arquitectura

### El ciclo del agente

```
Usuario: "Analiza Flamengo vs Vitoria, ¿hay valor en el hándicap?"

1. El modelo (Groq / Llama 3.3) recibe el mensaje + 4 herramientas disponibles
2. Decide llamar buscar_partido(equipo_a, equipo_b)
   → si found=false, responde de inmediato, sin gastar más herramientas
   → si found=true, usa los IDs de equipo devueltos para continuar
3. Llama obtener_forma_reciente() para ambos equipos
4. Llama obtener_cuotas() para el mercado de hándicap asiático
5. Estima una probabilidad propia y llama calcular_valor_esperado()
6. Responde con un JSON estructurado: recomendación, EV, confianza, justificación,
   cuotas comparadas
```

Cada paso se transmite al frontend vía Server-Sent Events mientras ocurre, no se
espera al resultado final para mostrar progreso.

### Las 4 herramientas del agente

| Herramienta               | Fuente                        | Qué hace                                                                         |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `buscar_partido`          | football-data.org             | Ubica el partido por nombres de equipo (matching AND + normalización de acentos) |
| `obtener_forma_reciente`  | football-data.org             | Últimos N resultados (W/D/L, goles) de un equipo                                 |
| `obtener_cuotas`          | the-odds-api.com              | Cuotas de hándicap asiático de varias casas de apuestas                          |
| `calcular_valor_esperado` | función pura, sin API externa | `EV = (probabilidad_estimada × cuota) - 1`                                       |

### Manejo de errores (3 niveles)

1. **Reintentos automáticos** en llamadas a APIs externas ante timeouts
2. **Reintentos separados** para fallos de generación del modelo (`tool_use_failed`,
   un problema conocido de confiabilidad de Llama con tool calling) — distinto de
   `RateLimitError`, que falla rápido sin reintentar (esperar no cambia el resultado)
3. **El JSON final distingue explícitamente**:
   - `encontrado: false` → partido no localizado
   - `encontrado: true, analisis_completo: false` → datos faltantes por fallo de
     herramienta (nunca se rellenan con información inventada)
   - `encontrado: true, analisis_completo: true, recomendacion: null` → análisis
     completo que concluyó que no hay valor claro (resultado legítimo, no un error)
   - `encontrado: true, recomendacion: <string>` → análisis completo con
     recomendación

---

## Stack técnico

| Capa              | Tecnología                           | Por qué                                                               |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------- |
| LLM del agente    | Groq (Llama 3.3 70B / 3.1 8B)        | Tool calling nativo, free tier generoso, compatible con SDK de OpenAI |
| Backend           | Python + FastAPI                     | —                                                                     |
| Datos de partidos | football-data.org (free tier)        | 12 competiciones principales                                          |
| Cuotas            | the-odds-api.com (free tier)         | Incluye mercado de hándicap asiático                                  |
| Persistencia      | SQLite                               | Historial de análisis, scopeado por session_id                        |
| Frontend          | React + Vite + TypeScript + Tailwind | Arquitectura feature-based                                            |
| Animaciones       | GSAP + ScrollTrigger                 | 100% gratis desde 2025 (adquisición por Webflow)                      |
| 3D (landing)      | React Three Fiber + drei             | Campo de partículas de fondo                                          |
| Streaming         | Server-Sent Events (SSE)             | Razonamiento del agente en tiempo real                                |

---

## Estructura del proyecto

### Backend

```
betting-agent/
├── agent/
│   ├── client.py            # Cliente de Groq
│   ├── orchestrator.py      # Loop del agente + manejo de errores + streaming
│   ├── db.py                # Persistencia SQLite del historial
│   └── tools/
│       ├── football_data.py # buscar_partido, obtener_forma_reciente
│       ├── odds_api.py      # obtener_cuotas
│       └── schemas.py       # Schemas de tool calling
├── main.py                  # Endpoints FastAPI
└── config.py                # Variables de entorno
```

### Frontend (feature-based)

```
src/
├── features/
│   ├── landing/
│   │   ├── pages/LandingPage.tsx
│   │   └── components/ (Hero, FeatureCards, ComoFunciona)
│   ├── partido-analisis/
│   │   ├── pages/AnalisisPage.tsx       # Orquesta, único que llama hooks
│   │   ├── components/                   # Puramente presentacionales
│   │   ├── hooks/ (usePartidosProximos, useAnalizarPartido)
│   │   ├── services/agenteApi.ts
│   │   └── types/
│   └── historial-analisis/
│       ├── pages/HistorialPage.tsx
│       ├── components/HistorialList.tsx  # Reutiliza ResultView de partido-analisis
│       ├── hooks/useHistorial.ts
│       ├── services/historialApi.ts
│       └── types/
├── shared/
│   ├── hooks/ (useScrollReveal, usePrefersReducedMotion)
│   ├── utils/sessionId.ts
│   └── lib/gsapConfig.ts
└── App.tsx                  # Trivial: solo rutas + layout
```

Regla seguida en todo el proyecto: `pages/` orquesta (llama hooks, decide qué
renderizar), `components/` solo dibuja (recibe props, sin fetch ni lógica de
negocio).

---

## Disclaimer

Este proyecto es una herramienta analítica y educativa de estadística deportiva. No
constituye asesoría financiera ni de apuestas. El valor esperado calculado depende de
la calidad de la estimación de probabilidad generada por el modelo, no es una
garantía matemática de resultado.
