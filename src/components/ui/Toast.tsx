"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { layers } from "@/lib/layers";
import { OverlayPortal } from "./OverlayPortal";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <OverlayPortal>
      <div
        className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all ${type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
        style={{ zIndex: layers.toast }}
      >
        {type === "error" ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
        {message}
        <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 transition">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </OverlayPortal>
  );
}

/** Drop-in hook — returns [show fn, toast JSX] */
export function useToast(): [
  (msg: string, type?: ToastType) => void,
  React.ReactNode,
] {
  const [state, setState] = useState<{ msg: string; type: ToastType } | null>(null);
  const show = (msg: string, type: ToastType = "success") => setState({ msg, type });
  const hide = () => setState(null);

  const node = state ? <Toast message={state.msg} type={state.type} onClose={hide} /> : null;
  return [show, node];
}
