/**
 * CSV Parser Utility for Arianee PCDS Cleaner
 * Parses CSV content and returns individual product rows as strings
 */

export interface CSVParseResult {
  headers: string[];
  rows: string[][];
  rawRowStrings: string[]; // Each row as a formatted string for AI processing
}

/**
 * Detects the delimiter used in CSV content (comma, semicolon, or tab)
 */
function detectDelimiter(content: string): string {
  const firstLine = content.split("\n")[0] || "";
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;

  if (tabs >= commas && tabs >= semicolons) return "\t";
  if (semicolons >= commas) return ";";
  return ",";
}

/**
 * Parses a CSV line respecting quoted fields
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parses CSV content into structured data
 */
export function parseCSV(content: string): CSVParseResult {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRowStrings: [] };
  }

  const delimiter = detectDelimiter(content);
  const headers = parseCSVLine(lines[0], delimiter);
  const rows: string[][] = [];
  const rawRowStrings: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i], delimiter);
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);

      // Create a formatted string for AI processing
      const rowString = headers
        .map((header, idx) => {
          const value = row[idx] || "";
          return value ? `${header}: ${value}` : null;
        })
        .filter(Boolean)
        .join("\n");

      rawRowStrings.push(rowString);
    }
  }

  return { headers, rows, rawRowStrings };
}

/**
 * Detects if input is CSV format (has multiple columns and rows)
 */
export function isCSVFormat(content: string): boolean {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return false;

  const delimiter = detectDelimiter(content);
  const firstLineCols = parseCSVLine(lines[0], delimiter).length;
  const secondLineCols = parseCSVLine(lines[1], delimiter).length;

  // CSV if: at least 2 columns and consistent column count
  return firstLineCols >= 2 && Math.abs(firstLineCols - secondLineCols) <= 1;
}

/**
 * Extracts a product name from a CSV row (tries common column names)
 */
export function extractProductName(
  headers: string[],
  row: string[]
): string {
  const nameColumns = [
    "name",
    "product_name",
    "productname",
    "product",
    "nom",
    "nom_produit",
    "nomproduit",
    "produit",
    "title",
    "titre",
    "description",
    "item",
    "article",
    "reference",
    "ref",
    "sku",
  ];

  for (const colName of nameColumns) {
    const idx = headers.findIndex(
      (h) => h.toLowerCase().replace(/[_\s-]/g, "") === colName.replace(/[_\s-]/g, "")
    );
    if (idx !== -1 && row[idx] && row[idx].trim().length > 0) {
      return row[idx].trim();
    }
  }

  // Fallback: use first non-empty column
  for (const cell of row) {
    if (cell && cell.trim().length > 0) {
      return cell.trim().substring(0, 50);
    }
  }

  return "Unknown Product";
}
