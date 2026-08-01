import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X, ListChecks, Type } from "lucide-react";
import {
  FIELD_TYPES,
  parseOptions,
  type FieldRow,
  type FieldType,
  type NewField,
} from "@/lib/fields";

export function FieldManager({
  title,
  subtitle,
  queryKey,
  fetchFields,
  addField,
  deleteField,
}: {
  title: string;
  subtitle: string;
  queryKey: unknown[];
  fetchFields: () => Promise<FieldRow[]>;
  addField: (f: NewField) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [optionsCsv, setOptionsCsv] = useState("");
  const [required, setRequired] = useState(false);
  const [error, setError] = useState("");

  const { data: fields, isLoading } = useQuery({ queryKey, queryFn: fetchFields });

  const reset = () => {
    setOpen(false);
    setLabel("");
    setType("text");
    setOptionsCsv("");
    setRequired(false);
    setError("");
  };

  const add = useMutation({
    mutationFn: () =>
      addField({
        label,
        field_type: type,
        options: type === "select" ? parseOptions(optionsCsv) : [],
        required,
      }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => setError(e.message || "Could not add field"),
  });

  const remove = useMutation({
    mutationFn: deleteField,
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const typeLabel = (t: FieldType) => FIELD_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      <div className="panel mt-6 divide-y divide-border">
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading fields…</p>}
        {!isLoading && fields?.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">No fields yet.</p>
        )}
        {fields?.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {f.field_type === "select" ? (
                  <ListChecks className="h-4 w-4 text-primary" />
                ) : (
                  <Type className="h-4 w-4 text-primary" />
                )}
                {f.label}
                {f.required && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    Required
                  </span>
                )}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {f.field_type === "select"
                  ? `Dropdown · ${f.options.join(", ") || "no options"}`
                  : typeLabel(f.field_type)}
              </p>
            </div>
            <button
              onClick={() => remove.mutate(f.id)}
              aria-label={`Delete ${f.label}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="panel w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add field</h2>
              <button onClick={reset} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                add.mutate();
              }}
            >
              <div>
                <label htmlFor="field-label" className="mb-1.5 block text-sm font-medium">
                  Field label
                </label>
                <input
                  id="field-label"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="field field-focus"
                  placeholder="e.g. Condition"
                />
              </div>

              <fieldset className="grid gap-2 sm:grid-cols-2">
                <legend className="mb-1.5 text-sm font-medium">Field type</legend>
                {FIELD_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm transition-colors ${
                      type === t.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="field-type"
                      checked={type === t.value}
                      onChange={() => setType(t.value)}
                      className="mt-0.5 accent-primary"
                    />
                    <span>
                      <span className="block font-medium">{t.label}</span>
                      <span className="block text-xs text-muted-foreground">{t.hint}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              {type === "select" && (
                <div>
                  <label htmlFor="field-options" className="mb-1.5 block text-sm font-medium">
                    Options (comma separated)
                  </label>
                  <input
                    id="field-options"
                    required
                    value={optionsCsv}
                    onChange={(e) => setOptionsCsv(e.target.value)}
                    className="field field-focus"
                    placeholder="New, Used"
                  />
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="accent-primary"
                />
                Required field
              </label>

              {error && (
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={reset} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={add.isPending} className="btn-primary">
                  {add.isPending ? "Adding…" : "Add field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
