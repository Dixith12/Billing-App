"use client";

import { useState } from "react";
import { useInventory } from "./use-inventory";

type MeasurementType = "height_width" | "kg" | "unit" | "";

export function useAddInventory(onSuccess?: () => void) {
  const { addItem } = useInventory();

  const [form, setForm] = useState({
    name: "",
    measurementType: "" as MeasurementType,
    height: 1,
    width: 1,
    pricePerHeight: "",
    pricePerWidth: "",
    pricePerKg: "",
    pricePerUnit: "",
    hsnCode: "", // ← NEW FIELD
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
      height: 1,
      width: 1,
      pricePerHeight: "",
      pricePerWidth: "",
      pricePerKg: "",
      pricePerUnit: "",
      hsnCode: "", // ← Reset HSN too
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
      if (!form.pricePerHeight.toString().trim()) {
        setError("Price per height is required");
        return false;
      }
      if (!form.pricePerWidth.toString().trim()) {
        setError("Price per width is required");
        return false;
      }

      dataToSave = {
        ...baseData,
        height: form.height,
        width: form.width,
        pricePerHeight: Number(form.pricePerHeight),
        pricePerWidth: Number(form.pricePerWidth),
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
