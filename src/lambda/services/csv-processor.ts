export interface CsvProcessingResult {
  rowCount: number;
  sum: number;
  average: number;
  malformedRows: number;
}

export function processCsv(content: string): CsvProcessingResult {
  const lines = content
    .split("\n")
    .filter((line) => line.trim())
    .slice(1); // Skip header

  let rowCount = 0;
  let sum = 0;
  let malformedRows = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const value = parseFloat(trimmedLine);
    if (!isNaN(value)) {
      sum += value;
      rowCount++;
    } else {
      malformedRows++;
    }
  }

  const average = rowCount > 0 ? sum / rowCount : 0;

  return {
    rowCount,
    sum,
    average,
    malformedRows,
  };
}
