// app/inventory/hooks/useEditInventoryForm.ts
"use client";

import { useEffect, useState } from "react";
import { useInventory } from "./use-inventory";
import type { InventoryItem } from "@/lib/types";

export function useEditInventory(
  item: InventoryItem | null,
  onSuccess?: () => void,
) {
  const { updateItem } = useInventory();

  const [form, setForm] = useState({
    name: "",
    measurementType: "" as InventoryItem["measurementType"],
    height: 1,
    width: 1,
    pricePerHeight: "",
    pricePerWidth: "",
    pricePerKg: "",
    pricePerUnit: "",
    hsnCode: "", // ← NEW FIELD
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        measurementType: item.measurementType || "",
        height: item.height ?? 1,
        width: item.width ?? 1,
        pricePerHeight: item.pricePerHeight?.toString() ?? "",
        pricePerWidth: item.pricePerWidth?.toString() ?? "",
        pricePerKg: item.pricePerKg?.toString() ?? "",
        pricePerUnit: item.pricePerUnit?.toString() ?? "",
        hsnCode: item.hsnCode || "", // ← Load existing HSN
      });
      setError(null);
    }
  }, [item]);

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const submit = () => {
    if (!item) return false;
    if (!form.name.trim()) {
      setError("Inventory name is required");
      return false;
    }

    const type = form.measurementType;

    const dataToSave: Partial<Omit<InventoryItem, "id" | "createdAt">> = {
      name: form.name.trim(),
      measurementType: type,
      hsnCode: form.hsnCode.trim() || null, // ← Save HSN (null if empty)
    };

    if (type === "height_width") {
      if (!form.pricePerHeight.trim()) {
        setError("Price per height is required");
        return false;
      }
      if (!form.pricePerWidth.trim()) {
        setError("Price per width is required");
        return false;
      }
      dataToSave.height = Number(form.height);
      dataToSave.width = Number(form.width);
      dataToSave.pricePerHeight = Number(form.pricePerHeight);
      dataToSave.pricePerWidth = Number(form.pricePerWidth);
    } else if (type === "kg") {
      if (!form.pricePerKg.trim()) {
        setError("Price per kg is required");
        return false;
      }
      dataToSave.pricePerKg = Number(form.pricePerKg);
    } else if (type === "unit") {
      if (!form.pricePerUnit.trim()) {
        setError("Price per unit is required");
        return false;
      }
      dataToSave.pricePerUnit = Number(form.pricePerUnit);
    }

    updateItem(item.id, dataToSave);
    onSuccess?.();
    return true;
  };

  return { form, updateField, submit, error };
}
