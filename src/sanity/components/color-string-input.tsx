"use client";

import { useCallback } from "react";
import type { CSSProperties, ChangeEvent } from "react";
import type { StringInputProps } from "sanity";
import { PatchEvent, set, unset } from "sanity";

const hexColorPattern = /^#[0-9a-f]{6}$/i;

const wrapperStyle: CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const rowStyle: CSSProperties = {
  alignItems: "center",
  display: "grid",
  gap: "0.75rem",
  gridTemplateColumns: "3rem minmax(0, 1fr) auto",
};

const colorInputStyle: CSSProperties = {
  background: "transparent",
  border: "0",
  cursor: "pointer",
  height: "2.5rem",
  padding: "0",
  width: "3rem",
};

const textInputStyle: CSSProperties = {
  background: "var(--card-bg-color)",
  border: "1px solid var(--card-border-color)",
  borderRadius: "0.1875rem",
  color: "inherit",
  font: "inherit",
  height: "2.5rem",
  padding: "0 0.75rem",
  width: "100%",
};

const clearButtonStyle: CSSProperties = {
  background: "transparent",
  border: "0",
  color: "inherit",
  cursor: "pointer",
  font: "inherit",
  opacity: 0.7,
  padding: "0",
  textDecoration: "underline",
};

const hintStyle: CSSProperties = {
  color: "var(--card-muted-fg-color)",
  fontSize: "0.75rem",
  lineHeight: 1.4,
  margin: 0,
};

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

function pickerValue(value: unknown) {
  if (typeof value !== "string") return "#ffffff";
  const normalized = normalizeHex(value);
  return hexColorPattern.test(normalized) ? normalized : "#ffffff";
}

export function ColorStringInput(props: StringInputProps) {
  const { elementProps, onChange, value } = props;
  const textValue = typeof value === "string" ? value : "";
  const currentPickerValue = pickerValue(value);

  const setValue = useCallback(
    (nextValue: string) => {
      const normalized = normalizeHex(nextValue);
      onChange(PatchEvent.from(normalized ? set(normalized) : unset()));
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    },
    [setValue],
  );

  const handlePickerChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    },
    [setValue],
  );

  const clearValue = useCallback(() => {
    onChange(PatchEvent.from(unset()));
  }, [onChange]);

  return (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        <input
          aria-label="Pick accent color"
          onChange={handlePickerChange}
          style={colorInputStyle}
          type="color"
          value={currentPickerValue}
        />
        <input
          {...elementProps}
          onChange={handleTextChange}
          placeholder="#ffffff"
          style={textInputStyle}
          type="text"
          value={textValue}
        />
        {textValue ? (
          <button onClick={clearValue} style={clearButtonStyle} type="button">
            Clear
          </button>
        ) : null}
      </div>
      <p style={hintStyle}>Use the picker or enter a CSS color value. Empty defaults the player accent to white.</p>
    </div>
  );
}
