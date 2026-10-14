"use client";

export function PrintButton() {
  return (
    <button type="button" className="pill-btn pill-btn-dark no-print" onClick={() => window.print()} data-ev="resume_print">
      <span>Download as PDF</span>
    </button>
  );
}
