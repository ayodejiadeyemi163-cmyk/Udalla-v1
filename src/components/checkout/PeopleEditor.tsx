"use client";

import { useState } from "react";
import { savePeopleStep } from "@/app/actions/checkout";
import { Plus } from "@/components/checkout/icons";
import type { Person } from "@/lib/store/types";

const ROLES: { value: Person["role"]; label: string }[] = [
  { value: "director", label: "Director" },
  { value: "shareholder", label: "Shareholder" },
  { value: "member", label: "Member" },
  { value: "trustee", label: "Trustee" },
];

function blankPerson(): Person {
  return {
    id: crypto.randomUUID(),
    name: "",
    email: "",
    role: "shareholder",
    ownership: 0,
    address: "",
  };
}

export function PeopleEditor({
  draftId,
  initialPeople,
  entityLabel,
}: {
  draftId: string;
  initialPeople: Person[];
  entityLabel: string;
}) {
  const [people, setPeople] = useState<Person[]>(
    initialPeople.length > 0
      ? initialPeople
      : [{ ...blankPerson(), role: "director", ownership: 100 }],
  );

  const total = people.reduce((sum, person) => sum + Number(person.ownership || 0), 0);
  const needsOwnership = people.some((person) =>
    ["shareholder", "member"].includes(person.role),
  );

  function update(id: string, patch: Partial<Person>) {
    setPeople((current) =>
      current.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    );
  }

  function remove(id: string) {
    setPeople((current) => current.filter((person) => person.id !== id));
  }

  return (
    <form action={savePeopleStep}>
      <input type="hidden" name="draftId" value={draftId} />
      <input type="hidden" name="people" value={JSON.stringify(people)} />

      <div className="space-y-4">
        {people.map((person, index) => (
          <fieldset key={person.id} className="card p-4 md:p-5">
            <legend className="px-1">
              <span className="eyebrow">Person {index + 1}</span>
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor={`name-${person.id}`}>
                  Full name
                </label>
                <input
                  id={`name-${person.id}`}
                  className="field"
                  value={person.name}
                  onChange={(event) => update(person.id, { name: event.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor={`email-${person.id}`}>
                  Email
                </label>
                <input
                  id={`email-${person.id}`}
                  type="email"
                  className="field"
                  value={person.email}
                  onChange={(event) => update(person.id, { email: event.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor={`role-${person.id}`}>
                  Role
                </label>
                <select
                  id={`role-${person.id}`}
                  className="field"
                  value={person.role}
                  onChange={(event) =>
                    update(person.id, { role: event.target.value as Person["role"] })
                  }
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor={`ownership-${person.id}`}>
                  Ownership percent
                </label>
                <input
                  id={`ownership-${person.id}`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className="field mono"
                  value={person.ownership}
                  onChange={(event) =>
                    update(person.id, { ownership: Number(event.target.value) })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor={`address-${person.id}`}>
                  Residential address
                </label>
                <input
                  id={`address-${person.id}`}
                  className="field"
                  value={person.address}
                  onChange={(event) => update(person.id, { address: event.target.value })}
                  required
                />
              </div>
            </div>
            {people.length > 1 ? (
              <button
                type="button"
                onClick={() => remove(person.id)}
                className="mt-3 text-[12px] text-danger-600 hover:underline"
              >
                Remove this person
              </button>
            ) : null}
          </fieldset>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setPeople((current) => [...current, blankPerson()])}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-navy-900 hover:underline"
        >
          <Plus /> Add another person
        </button>
        <p
          className={`text-[12.5px] ${
            needsOwnership && total !== 100 ? "text-danger-600" : "text-slate-muted"
          }`}
          aria-live="polite"
        >
          Ownership total: {total} percent
          {needsOwnership && total !== 100 ? " (must total 100)" : ""}
        </p>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-slate-muted">
        Add every {entityLabel === "LLC" ? "member" : "director and shareholder"} required for
        this filing. Ownership across shareholders or members must total 100 percent.
      </p>

      <button type="submit" className="btn btn-primary mt-5 w-full sm:w-auto">
        Continue to documents
      </button>
    </form>
  );
}
