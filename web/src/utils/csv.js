export const toCsv = (rows, cols) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.map((c) => esc(c.header)).join(','), ...rows.map((r) => cols.map((c) => esc(c.csv ? c.csv(r) : r[c.key])).join(','))].join('\n');
};
export const downloadCsv = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
