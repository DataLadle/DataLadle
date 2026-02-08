"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface RegisterGatewayModalProps {
  onClose: () => void;
  onRegister: (gatewayId: string, securityCode: string) => void;
}

export function RegisterGatewayModal({ onClose, onRegister }: RegisterGatewayModalProps) {
  const [gatewayId, setGatewayId] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(gatewayId, securityCode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-gateway-title"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="register-gateway-title" className="text-lg font-bold text-white">
            Register Gateway
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          Enter the Gateway ID and Security Code printed on your Monnit gateway device.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">
              Gateway ID
            </label>
            <input
              type="text"
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 font-mono text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              placeholder="e.g. 987654"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">
              Security Code
            </label>
            <input
              type="text"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 font-mono text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              placeholder="Printed on device"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
