"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Reusable form state management hook.
 *
 * Handles: form state, error/saved/loading states, submit with fetch + router.refresh.
 * Each form component becomes a short field definition passed to this hook.
 *
 * Supports:
 *   - Optional fields excluded from payload when empty
 *   - Custom payload mapping via `transformPayload`
 *   - API dropdown fetches via `dropdownFetch`
 *   - Conditional rendering via `isEmptyDropdown`
 *
 * Usage (simple):
 *   const { form, setField, error, saved, loading, onSubmit } = useForm({
 *     endpoint: "/api/fields",
 *     initialValues: { name: "", areaHa: "", crop: "" },
 *   });
 *
 * Usage (with dropdown):
 *   const { form, setField, dropdownItems, dropdownLoading, onSubmit } = useForm({
 *     endpoint: "/api/harvests",
 *     initialValues: { fieldId: "", crop: "", quantityTonnes: "" },
 *     dropdownFetch: { url: "/api/fields", key: "fields", valueField: "id", labelField: "name" },
 *   });
 *
 * Usage (with payload transform):
 *   const { form, setField, onSubmit } = useForm({
 *     endpoint: "/api/purchases",
 *     initialValues: { lot: "", seller: "" },
 *     transformPayload: (payload) => ({ ...payload, buyer: payload.seller, status: "enquiry" }),
 *   });
 */
export interface DropdownFetchConfig {
  /** URL to fetch dropdown options from. */
  url: string;
  /** Key in the JSON response that holds the array (e.g. "fields", "equipment"). */
  key: string;
  /** Field name for the option value (e.g. "id"). */
  valueField: string;
  /** Field name for the option label (e.g. "name"). */
  labelField: string;
}

export interface UseFormOptions {
  /** API endpoint to POST/PUT to (e.g. "/api/fields"). */
  endpoint: string;
  /** Initial values for the form. */
  initialValues: Record<string, string | number>;
  /** Optional: fields to exclude from the payload when empty. */
  optionalFields?: string[];
  /** Optional: message shown on success. */
  successMessage?: string;
  /** Optional: message shown on error. */
  errorMessage?: string;
  /** Optional: transform the payload before sending. Receives the raw payload and returns the final one. */
  transformPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
  /** Optional: fetch dropdown options from an API. Populates dropdownItems and dropdownLoading. */
  dropdownFetch?: DropdownFetchConfig;
  /** Optional: HTTP method. Default "POST". Use "PUT" for edit forms. */
  method?: "POST" | "PUT";
  /** Optional: record ID to include in the payload (required for PUT). */
  id?: number;
}

export interface DropdownItem {
  id: number | string;
  name: string;
}

export interface UseFormReturn {
  /** Current form values. */
  form: Record<string, string | number>;
  /** Update a single field. */
  setField: (name: string, value: string | number) => void;
  /** Reset form to initial values. */
  reset: () => void;
  /** Error message (empty string if no error). */
  error: string;
  /** Whether the last submission succeeded. */
  saved: boolean;
  /** Whether a submission is in progress. */
  loading: boolean;
  /** Form submit handler — call with e.preventDefault(). */
  onSubmit: (e: React.FormEvent) => Promise<void>;
  /** Dropdown items from API fetch (if dropdownFetch is configured). */
  dropdownItems: DropdownItem[];
  /** Whether dropdown items are still loading. */
  dropdownLoading: boolean;
  /** Whether dropdown is empty (for conditional rendering). */
  dropdownEmpty: boolean;
}

export function useForm(options: UseFormOptions): UseFormReturn {
  const router = useRouter();
  const {
    endpoint,
    initialValues,
    optionalFields = [],
    successMessage = "Saved.",
    errorMessage = "Could not save.",
    transformPayload,
    dropdownFetch,
    method = "POST",
    id,
  } = options;

  const [form, setForm] = useState<Record<string, string | number>>(initialValues);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown state
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Fetch dropdown options if configured
  useEffect(() => {
    if (!dropdownFetch) return;
    setDropdownLoading(true);
    fetch(dropdownFetch.url)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.ok && Array.isArray(data[dropdownFetch.key])) {
          const items = data[dropdownFetch.key].map((item: any) => ({
            id: item[dropdownFetch.valueField],
            name: item[dropdownFetch.labelField],
          }));
          setDropdownItems(items);
        }
        setDropdownLoading(false);
      })
      .catch(() => {
        setDropdownLoading(false);
      });
  }, [dropdownFetch]);

  function setField(name: string, value: string | number) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function reset() {
    setForm(initialValues);
    setError("");
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    // Build payload: exclude empty optional fields
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(form)) {
      if (optionalFields.includes(key) && (value === "" || value === undefined)) continue;
      payload[key] = value;
    }

    // For PUT requests, include the record ID
    if (method === "PUT" && id !== undefined) {
      payload.id = id;
    }

    // Apply custom transform if provided
    const finalPayload = transformPayload ? transformPayload(payload) : payload;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(data.error || errorMessage);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setField,
    reset,
    error,
    saved,
    loading,
    onSubmit,
    dropdownItems,
    dropdownLoading,
    dropdownEmpty: !dropdownLoading && dropdownItems.length === 0,
  };
}
