import { processCsv } from "../src/lambda/services/csv-processor";

describe("CSV Processor", () => {
  describe("processCsv", () => {
    it("should process a valid CSV correctly", () => {
      const csv = "amount\n10\n20\n30\n40";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(4);
      expect(result.sum).toBe(100);
      expect(result.average).toBe(25);
      expect(result.malformedRows).toBe(0);
    });

    it("should handle empty CSV", () => {
      const csv = "amount";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(0);
      expect(result.sum).toBe(0);
      expect(result.average).toBe(0);
      expect(result.malformedRows).toBe(0);
    });

    it("should count malformed rows", () => {
      const csv = "amount\n10\ninvalid\n20\nnotanumber";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(2);
      expect(result.sum).toBe(30);
      expect(result.average).toBe(15);
      expect(result.malformedRows).toBe(2);
    });

    it("should handle floating point numbers", () => {
      const csv = "amount\n10.5\n20.3\n30.2";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(3);
      expect(Math.round(result.sum * 100) / 100).toBe(61);
      expect(Math.round(result.average * 100) / 100).toBe(20.33);
      expect(result.malformedRows).toBe(0);
    });

    it("should handle negative numbers", () => {
      const csv = "amount\n10\n-5\n20";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(3);
      expect(result.sum).toBe(25);
      expect(Math.round(result.average * 100) / 100).toBe(8.33);
      expect(result.malformedRows).toBe(0);
    });

    it("should skip empty lines", () => {
      const csv = "amount\n10\n\n20\n\n\n30";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(3);
      expect(result.sum).toBe(60);
      expect(result.average).toBe(20);
      expect(result.malformedRows).toBe(0);
    });

    it("should handle whitespace", () => {
      const csv = "amount\n  10  \n  20  \n  30  ";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(3);
      expect(result.sum).toBe(60);
      expect(result.average).toBe(20);
      expect(result.malformedRows).toBe(0);
    });

    it("should handle single value", () => {
      const csv = "amount\n42";
      const result = processCsv(csv);

      expect(result.rowCount).toBe(1);
      expect(result.sum).toBe(42);
      expect(result.average).toBe(42);
      expect(result.malformedRows).toBe(0);
    });
  });
});



