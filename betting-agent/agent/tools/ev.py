def calcular_valor_esperado(probabilidad_estimada: float, cuota_decimal: float) -> dict:
    if not 0 <= probabilidad_estimada <= 1:
        return {
            "error": True,
            "mensaje": (
                f"probabilidad_estimada debe estar entre 0 y 1 "
                f"(se recibió {probabilidad_estimada})."
            ),
        }
    if cuota_decimal <= 1:
        return {
            "error": True,
            "mensaje": (
                f"cuota_decimal debe ser mayor a 1 "
                f"(se recibió {cuota_decimal})."
            ),
        }

    ev = round((probabilidad_estimada * cuota_decimal) - 1, 4)

    if ev > 0:
        interpretacion = "positivo"
    elif ev < 0:
        interpretacion = "negativo"
    else:
        interpretacion = "neutro"

    return {
        "ev": ev,
        "interpretacion": interpretacion,
        "probabilidad_estimada": probabilidad_estimada,
        "cuota_decimal": cuota_decimal,
    }