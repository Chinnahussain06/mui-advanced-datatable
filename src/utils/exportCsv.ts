/**
 * Utility to export an array of flat objects to CSV and trigger a download
 */
export const exportCsv = (data: any[], filename: string = "table_export.csv") => {
  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }

  // extract headers from the first object
  const headers = Object.keys(data[0]);
  
  const csvRows = [
    headers.join(",") // header row
  ];

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : "";
      const valStr = typeof val === "object" ? JSON.stringify(val) : String(val);
      // escape double quotes and wrap in quotes to prevent issue with commas
      const escaped = valStr.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
