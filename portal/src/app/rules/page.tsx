"use client";

import { Plus, Pencil, Trash2, Pause } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import {
  MOCK_RULE_DEFINITIONS,
  type RuleDefinition,
} from "@/utils/mockData";

export default function RulesPage() {
  const handleEditRule = (rule: RuleDefinition) => {
    console.log("Edit rule:", rule);
  };

  const handleDeleteRule = (rule: RuleDefinition) => {
    console.log("Delete rule:", rule);
  };

  const handlePauseRule = (rule: RuleDefinition) => {
    console.log("Pause rule:", rule);
  };

  const handleAddRule = () => {
    console.log("Add rule");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Rules</h2>
              <p className="mt-1 text-slate-400">
                Configuration center for monitoring logic
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRule}
              className="flex items-center gap-2 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rule Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Assigned Devices
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RULE_DEFINITIONS.map((rule) => (
                  <tr
                    key={rule.id}
                    className={`border-b border-slate-800/80 transition-colors hover:bg-slate-800 last:border-0 ${
                      rule.paused ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{rule.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-slate-300">
                        {rule.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">
                        {rule.assignedSensorCount} Sensors
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditRule(rule)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-[#26ADE4]"
                          aria-label="Edit rule"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePauseRule(rule)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-amber-400"
                          aria-label="Pause rule"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
                          aria-label="Delete rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
