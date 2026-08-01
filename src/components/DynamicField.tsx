import type { FieldRow } from "@/lib/fields";

export function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FieldRow;
  value: string;
  onChange: (v: string) => void;
}) {
  const common = "field field-focus";

  if (field.field_type === "select") {
    return (
      <select
        id={field.id}
        required={field.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={common}
      >
        <option value="">Select…</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  if (field.field_type === "textarea") {
    return (
      <textarea
        id={field.id}
        required={field.required}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={common}
      />
    );
  }

  if (field.field_type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          id={field.id}
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="accent-primary"
        />
        Yes
      </label>
    );
  }

  return (
    <input
      id={field.id}
      required={field.required}
      type={field.field_type === "number" ? "number" : field.field_type === "image" || field.field_type === "video" ? "url" : "text"}
      inputMode={field.field_type === "number" ? "decimal" : undefined}
      placeholder={
        field.field_type === "image"
          ? "https://…/image.jpg"
          : field.field_type === "video"
            ? "https://…/video.mp4"
            : undefined
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={common}
    />
  );
}
