import React, { useRef, useEffect } from "react";
import "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer-resources-en";
import "@grapecity/spread-sheets-designer";
import { Designer } from "@grapecity/spread-sheets-designer-react";

import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css";
import "@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";

import * as GC from "@grapecity/spread-sheets";

export default function ExcelCompiler({ externalRun, onResult }) {
  const workbookRef = useRef(null);

  const designerInitialized = (designer) => {
    try {
      let workbook = null;

      if (designer && typeof designer.getWorkbook === "function") {
        workbook = designer.getWorkbook();
      }

      if (!workbook) {
        const host = document.createElement("div");
        workbook = new GC.Spread.Sheets.Workbook(host);
        designer.setWorkbook(workbook);
      }

      workbookRef.current = workbook;

      const sheet = workbook.getActiveSheet();
      sheet.suspendPaint();
      sheet.setValue(0, 0, "A1");
      sheet.setValue(0, 1, "B1");
      sheet.setValue(1, 0, 10);
      sheet.setValue(1, 1, 20);
      sheet.setFormula(2, 0, "=SUM(A2:B2)");
      sheet.resumePaint();

      workbook.refresh();
    } catch (err) {
      console.error("Designer init error:", err);
    }
  };

  // 🔥 THIS IS THE IMPORTANT PART
  useEffect(() => {
    if (!externalRun) return;
    if (!workbookRef.current) return;

    console.log("📘 Excel Run Triggered");

    const workbook = workbookRef.current;
    const sheet = workbook.getActiveSheet();

    const rowCount = sheet.getRowCount();
    const colCount = sheet.getColumnCount();

    const results = [];

    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const formula = sheet.getFormula(r, c);
        if (formula) {
          const value = sheet.getValue(r, c);
          const cell = GC.Spread.Sheets.CalcEngine.rangeToFormula(
            new GC.Spread.Sheets.Range(r, c, 1, 1)
          );

          results.push({
            cell,
            formula,
            value,
          });
        }
      }
    }

    console.log("✅ Excel Formula Results:", results);

    if (onResult) {
      onResult({
        p_type: "excel",
        answers: results,
      });
    }
  }, [externalRun, onResult]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Designer
        styleInfo={{ width: "100%", height: "100%" }}
        designerInitialized={designerInitialized}
      />
    </div>
  );
}
