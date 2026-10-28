# Esquema del catálogo estructurado (v1)

Un objeto por ítem. `data/catalog/items.json` es la fuente; `lib/catalog-data.ts`
se genera desde ahí. Campos de origen (del Excel) nunca se alteran por
enriquecimiento: `id`, `name`, `kind`, `category`, `brand`, `price`, `unit`,
`inStock`. Nunca se guarda precio de compra ni cantidad de stock.

```jsonc
{
  "id": "r-motocompresor-embraco-1-4-r600",   // slug estable
  "name": "Motocompresor Embraco 1/4 R600",    // nombre tal cual del inventario
  "kind": "repuesto",                          // "repuesto" | "producto"
  "category": "Refrigeración",                 // categoría de navegación
  "brand": "Embraco",                          // marca del ítem (fabricante de la pieza)
  "price": 370,                                // soles, null = consultar
  "unit": "unidad",
  "inStock": true,

  // --- enriquecimiento ---
  "partType": "Motocompresor",                 // tipo de pieza normalizado (Title case, singular)
  "appliance": "Refrigeradora",                // equipo al que corresponde, uno de APPLIANCES
  "fitsBrands": ["Coldex", "Mabe", "Indurama"],// marcas de equipos compatibles (vacío si no se sabe)
  "fitsModels": ["EM2U40HLT"],                 // modelos de equipo compatibles verificados (vacío si no se sabe)
  "modelCodes": ["1/4", "R600"],               // códigos/variantes extraídos del nombre
  "specs": { "potencia": "1/4 HP", "refrigerante": "R600a" }, // claves en minúsculas, valores con unidad
  "summary": "Compresor hermético Embraco de 1/4 HP para refrigeradoras domésticas con gas R600a.", // 1-2 frases, factual
  "validation": {
    "status": "verified",                      // "verified" (fuente web confirma) | "inferred" (deducido del nombre) | "unverified"
    "confidence": 0.9,                         // 0-1
    "sources": ["https://..."],                // URLs consultadas que respaldan lo anterior
    "notes": "Ficha técnica Embraco EM2U40HLT.",// qué confirmó la fuente o por qué no se encontró
    "checkedAt": "2026-10-28"
  }
}
```

APPLIANCES: "Refrigeradora", "Congeladora", "Lavadora", "Secadora / Lavaseca",
"Cocina", "Horno", "Campana extractora", "Terma", "Ducha eléctrica",
"Aire acondicionado", "Licuadora", "Iluminación", "Instalación general", "Otro".

Reglas:
- No inventar compatibilidad. Si no hay fuente, `fitsModels: []` y `status: "inferred"` o `"unverified"`.
- `summary` sin adjetivos de venta; describe qué es y para qué sirve.
- Mantener tildes y nombres originales; corregir solo en `partType`/`summary`.
