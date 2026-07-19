"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export type ModalType = "success" | "warning" | "error" | "info" | "confirm";

interface CustomModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function CustomModal({
  isOpen,
  type,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel
}: CustomModalProps) {
  
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />;
      case "error":
        return <XCircleIcon className="w-12 h-12 text-red-500" />;
      case "confirm":
        return <ExclamationTriangleIcon className="w-12 h-12 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-12 h-12 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === "confirm" ? undefined : onConfirm}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Top Indicator Border */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              type === "success" ? "bg-green-500" :
              type === "warning" ? "bg-amber-500" :
              type === "error" ? "bg-red-500" :
              "bg-[#0D4A86]"
            }`} />

            <div className="mb-4 mt-2">
              {getIcon()}
            </div>

            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {title}
            </h3>

            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-6 w-full justify-center">
              {type === "confirm" && onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 max-w-[140px] border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={onConfirm}
                className={`flex-1 max-w-[140px] py-2.5 rounded-xl font-bold text-white transition text-sm shadow-md hover:shadow-lg cursor-pointer ${
                  type === "success" ? "bg-green-600 hover:bg-green-700 shadow-green-600/10" :
                  type === "warning" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10" :
                  type === "error" ? "bg-red-600 hover:bg-red-700 shadow-red-600/10" :
                  "bg-[#0D4A86] hover:bg-[#083A6B] shadow-blue-600/10"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
