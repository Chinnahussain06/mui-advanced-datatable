import { mkConfig, generateCsv, download } from "export-to-csv";

export const exportCsv = (data: any[]) => {
  if (!data || data.length === 0) return;

  const csvConfig = mkConfig({ useKeysAsHeaders: true });

  const processedData: any = data.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key,
        typeof value === "object" && value !== null ? JSON.stringify(value) : value,
      ])
    )
  );

  const generatedData = generateCsv(csvConfig)(processedData);
  download(csvConfig)(generatedData);
};
