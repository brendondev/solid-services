/**
 * Exporta dados para CSV
 */
export function exportToCSV<T>(
  data: T[],
  filename: string,
  columns?: {
    key: keyof T;
    label: string;
  }[]
) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Se colunas não forem especificadas, usa todas as chaves do primeiro objeto
  const cols =
    columns ||
    (Object.keys(data[0] as object) as (keyof T)[]).map((key) => ({
      key,
      label: String(key),
    }));

  // Header
  const header = cols.map((col) => col.label).join(',');

  // Rows
  const rows = data.map((row) => {
    return cols
      .map((col) => {
        const value = row[col.key];

        // Handle different types
        if (value === null || value === undefined) {
          return '';
        }

        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }

        const stringValue = String(value);

        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (
          stringValue.includes(',') ||
          stringValue.includes('\n') ||
          stringValue.includes('"')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',');
  });

  // Combine
  const csv = [header, ...rows].join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
