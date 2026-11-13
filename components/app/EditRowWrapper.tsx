"use client";

import { useState, type ReactNode } from "react";

/**
 * Shared client component that manages edit state for a row/list item.
 * Renders either the edit form or the normal row based on editingId state.
 * This allows server component pages to use inline editing without
 * importing useState at the page level.
 */
export default function EditRowWrapper<T>({
  id,
  items,
  renderNormal,
  renderEdit,
  colSpan,
}: {
  id: number;
  items: T[];
  renderNormal: (item: T) => ReactNode;
  renderEdit: (item: T) => ReactNode;
  colSpan?: number;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const item = items.find((i: any) => i.id === id);
  if (!item) return null;

  if (editingId === id) {
    if (colSpan) {
      return (
        <tr key={id}>
          <td colSpan={colSpan}>{renderEdit(item)}</td>
        </tr>
      );
    }
    return <li key={id}>{renderEdit(item)}</li>;
  }

  return <>{renderNormal(item)}</>;
}

/**
 * Wrapper for a whole table/list with edit state management.
 * Use this instead of useState in server component pages.
 */
export function EditableList<T>({
  items,
  renderNormal,
  renderEdit,
  colSpan,
}: {
  items: T[];
  renderNormal: (item: T, setEditing: (id: number) => void) => ReactNode;
  renderEdit: (item: T, cancel: () => void) => ReactNode;
  colSpan?: number;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <>
      {items.map((item: any) => {
        if (editingId === item.id) {
          if (colSpan) {
            return (
              <tr key={item.id}>
                <td colSpan={colSpan}>{renderEdit(item, () => setEditingId(null))}</td>
              </tr>
            );
          }
          return <li key={item.id}>{renderEdit(item, () => setEditingId(null))}</li>;
        }
        return <>{renderNormal(item, () => setEditingId(item.id))}</>;
      })}
    </>
  );
}
