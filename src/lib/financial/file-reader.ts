import * as XLSX from "xlsx";

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, unknown>[];
  rawContent: string;
  allSheetData: unknown[][];
}

/**
 * Reads a financial file (Excel/CSV) and attempts to find the real data header row
 * by skipping metadata rows (bank name, dates, empty rows, etc.).
 */
export async function readFinancialFile(file: File): Promise<ParsedSheet> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("El archivo no contiene hojas de datos.");

  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("No se pudo leer la hoja de datos.");

  // Get raw CSV for content analysis
  const rawContent = XLSX.utils.sheet_to_csv(sheet).slice(0, 5000);

  // Get ALL rows as arrays (no header assumption)
  const allRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    rawNumbers: true,
  }) as unknown[][];

  // Find the best header row by looking for rows with multiple text cells
  const headerRowIndex = findHeaderRow(allRows);

  // Build headers from identified row
  const headerRow = allRows[headerRowIndex] || [];
  const headers: string[] = headerRow.map((cell, i) => {
    const val = cell == null ? "" : String(cell).trim();
    return val || `Col_${i}`;
  });

  // Build data rows from everything after the header
  const dataRows: Record<string, unknown>[] = [];
  for (let i = headerRowIndex + 1; i < allRows.length; i++) {
    const row = allRows[i];
    if (!row || row.every(c => c === "" || c == null)) continue; // skip empty
    const record: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? "";
    });
    dataRows.push(record);
  }

  // Also provide standard JSON parse as fallback
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const jsonHeaders = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  // Use the better result (the one with more non-empty values)
  const smartScore = scoreDataQuality(dataRows, headers);
  const defaultScore = scoreDataQuality(jsonData, jsonHeaders);

  if (smartScore >= defaultScore) {
    return { headers, rows: dataRows, rawContent, allSheetData: allRows };
  }

  return { headers: jsonHeaders, rows: jsonData, rawContent, allSheetData: allRows };
}

/**
 * Finds the header row index by looking for a row where multiple cells contain
 * short text strings typical of column headers.
 */
function findHeaderRow(allRows: unknown[][]): number {
  let bestIndex = 0;
  let bestScore = 0;

  const limit = Math.min(allRows.length, 20); // only check first 20 rows
  for (let i = 0; i < limit; i++) {
    const row = allRows[i];
    if (!row) continue;

    let textCells = 0;
    let nonEmpty = 0;
    for (const cell of row) {
      if (cell == null || cell === "") continue;
      nonEmpty++;
      const s = String(cell).trim();
      // A header cell is typically short text (not a pure number, not too long)
      if (s.length > 0 && s.length < 50 && isNaN(Number(s.replace(/[$,%]/g, "")))) {
        textCells++;
      }
    }

    // Score: prefer rows with many text columns (headers) and at least 2 non-empty cells
    const score = textCells * 3 + nonEmpty;
    if (textCells >= 2 && score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function scoreDataQuality(rows: Record<string, unknown>[], headers: string[]): number {
  if (rows.length === 0) return 0;
  let nonZero = 0;
  const sample = rows.slice(0, 10);
  for (const r of sample) {
    for (const h of headers) {
      const v = r[h];
      if (v != null && v !== "" && v !== 0) nonZero++;
    }
  }
  return nonZero;
}

export function computeFileHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
