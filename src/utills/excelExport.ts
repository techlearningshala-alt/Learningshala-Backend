import ExcelJS from "exceljs";
import { Response } from "express";

export interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
  getValue?: (row: any) => any;
}

/**
 * Generate and stream Excel file to response
 * @param res Express Response object
 * @param data Array of data objects to export
 * @param columns Column definitions with key, header, and optional width/getValue
 * @param filename Filename for the downloaded file (without extension)
 */
export async function exportToExcel(
  res: Response,
  data: any[],
  columns: ExcelColumn[],
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Set column headers and widths
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  data.forEach((row) => {
    const excelRow: any = {};
    columns.forEach((col) => {
      excelRow[col.key] = col.getValue ? col.getValue(row) : row[col.key] ?? "-";
    });
    worksheet.addRow(excelRow);
  });

  // Auto-fit columns (optional, can be slow for large datasets)
  // worksheet.columns.forEach((column) => {
  //   if (column.header) {
  //     column.width = Math.max(column.header.length + 2, 15);
  //   }
  // });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}_${new Date().toISOString().split("T")[0]}.xlsx"`
  );

  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
}
