import { AREAS, PRIORITIES, STATUSES, type ItemInput } from "@/lib/model";
import { fieldClass } from "./styles";

export function ItemFields({
  idPrefix,
  value,
  onChange,
  disabled,
}: {
  idPrefix: string;
  value: ItemInput;
  onChange: (patch: Partial<ItemInput>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm" htmlFor={`${idPrefix}-title`}>
        <span className="text-muted">Title</span>
        <input
          id={`${idPrefix}-title`}
          className={`${fieldClass} h-11`}
          value={value.title}
          maxLength={160}
          required
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>
      <label className="grid gap-1 text-sm" htmlFor={`${idPrefix}-note`}>
        <span className="text-muted">Note</span>
        <textarea
          id={`${idPrefix}-note`}
          className={`${fieldClass} min-h-24 py-2`}
          value={value.note}
          maxLength={20000}
          rows={4}
          disabled={disabled}
          onChange={(event) => onChange({ note: event.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-2 grid gap-1 text-sm sm:col-span-1" htmlFor={`${idPrefix}-area`}>
          <span className="text-muted">Area</span>
          <select
            id={`${idPrefix}-area`}
            className={`${fieldClass} h-11`}
            value={value.area}
            disabled={disabled}
            onChange={(event) => onChange({ area: event.target.value as ItemInput["area"] })}
          >
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${idPrefix}-status`}>
          <span className="text-muted">Status</span>
          <select
            id={`${idPrefix}-status`}
            className={`${fieldClass} h-11`}
            value={value.status}
            disabled={disabled}
            onChange={(event) => onChange({ status: event.target.value as ItemInput["status"] })}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${idPrefix}-priority`}>
          <span className="text-muted">Priority</span>
          <select
            id={`${idPrefix}-priority`}
            className={`${fieldClass} h-11`}
            value={value.priority}
            disabled={disabled}
            onChange={(event) =>
              onChange({ priority: event.target.value as ItemInput["priority"] })
            }
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${idPrefix}-due`}>
          <span className="text-muted">Due</span>
          <input
            id={`${idPrefix}-due`}
            className={`${fieldClass} h-11`}
            type="date"
            value={value.due ?? ""}
            disabled={disabled}
            onChange={(event) => onChange({ due: event.target.value || null })}
          />
        </label>
      </div>
    </div>
  );
}
