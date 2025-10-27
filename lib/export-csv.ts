export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
) {
  if (data.length === 0) {
    console.warn("No hay datos para exportar")
    return
  }

  // Obtener los encabezados
  const keys = Object.keys(data[0]) as (keyof T)[]
  const headerRow = headers
    ? keys.map(key => headers[key] || String(key)).join(",")
    : keys.join(",")

  // Convertir datos a filas CSV
  const csvRows = data.map(row =>
    keys.map(key => {
      const value = row[key]
      // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
      const stringValue = String(value ?? "")
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(",")
  )

  // Combinar encabezados y filas
  const csv = [headerRow, ...csvRows].join("\n")

  // Crear blob y descargar
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
