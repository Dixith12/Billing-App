"use client";

import { useState } from "react";
import { useInventory } from "./use-inventory";

type MeasurementType = "height_width" | "kg" | "unit" | "";

export function useAddInventory(onSuccess?: () => void) {
  const { addItem } = useInventory();

  const [form, setForm] = useState({
  name: "",
  measurementType: "" as MeasurementType,
  pricePerSqFt: "",
  pricePerKg: "",
  pricePerUnit: "",
  hsnCode: "",
});

  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const reset = () => {
    setForm({
  name: "",
  measurementType: "",
  pricePerSqFt: "",
  pricePerKg: "",
  pricePerUnit: "",
  hsnCode: "",
});
    setError(null);
  };

  const submit = () => {
    if (!form.name.trim()) {
      setError("Inventory name is required");
      return false;
    }

    if (!form.measurementType) {
      setError("Please select a measurement type");
      return false;
    }

    const type = form.measurementType;

    // Common data
    const baseData = {
      name: form.name.trim(),
      measurementType: type,
      hsnCode: form.hsnCode.trim() || null, // ← Save HSN (null if empty)
    };

    let dataToSave: any;

   if (type === "height_width") {
  if (!form.pricePerSqFt.toString().trim()) {
    setError("Price per sq ft is required");
    return false;
  }

  dataToSave = {
    ...baseData,
    pricePerSqFt: Number(form.pricePerSqFt),
  };
} else if (type === "kg") {
      if (!form.pricePerKg.toString().trim()) {
        setError("Price per kg is required");
        return false;
      }

      dataToSave = {
        ...baseData,
        pricePerKg: Number(form.pricePerKg),
      };
    } else if (type === "unit") {
      if (!form.pricePerUnit.toString().trim()) {
        setError("Price per unit is required");
        return false;
      }

      dataToSave = {
        ...baseData,
        pricePerUnit: Number(form.pricePerUnit),
      };
    }

    // Send to inventory context / firebase
    addItem(dataToSave);

    reset();
    onSuccess?.();
    return true;
  };

  return {
    form,
    updateField,
    submit,
    error,
    reset,
  };
}
