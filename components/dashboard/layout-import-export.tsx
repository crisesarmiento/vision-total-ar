"use client";

import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DashboardLayout } from "@/lib/dashboard-layout";
import { importDashboardLayoutFromJson } from "@/lib/dashboard-layout";

type Props = {
  layoutPayload: DashboardLayout;
  onImport: (layout: DashboardLayout) => void;
};

export function LayoutImportExport({ layoutPayload, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = JSON.stringify(layoutPayload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vision-ar-layout.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-imported if needed
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") return;

      const result = importDashboardLayoutFromJson(text);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      onImport(result.layout);

      if (result.skippedChannelIds.length > 0) {
        toast.warning(
          `Layout importado. Se omitieron ${result.skippedChannelIds.length} señal(es) no disponible(s): ${result.skippedChannelIds.join(", ")}.`,
        );
      } else {
        toast.success("Layout importado correctamente.");
      }
    };
    reader.onerror = () => {
      toast.error("No se pudo leer el archivo.");
    };
    reader.readAsText(file);
  }

  return (
    <>
      <Button variant="secondary" onClick={handleExport} title="Descargar el layout actual como JSON">
        <Download className="mr-2 h-4 w-4" />
        Exportar layout
      </Button>
      <Button
        variant="secondary"
        onClick={handleImportClick}
        title="Importar un layout desde un archivo JSON"
      >
        <Upload className="mr-2 h-4 w-4" />
        Importar layout
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        aria-hidden="true"
        onChange={handleFileChange}
      />
    </>
  );
}
