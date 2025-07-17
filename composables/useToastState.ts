import type { ToastMessageOptions } from "primevue/toast";

export interface ToastState {
  severity: ToastMessageOptions["severity"] /* 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' */;
  summary: string;
  detail?: string;
  life?: number;
}

/**
 * 토스트 메시지 상태 관리
 */
export const useToastState = () => {
  const toastState = useState<ToastState | null>("toast-state", () => null);

  const setToastState = (
    severity: ToastMessageOptions["severity"],
    summary: string,
    detail?: string,
    life?: number,
  ) => {
    toastState.value = { severity, summary, detail, life: life ?? 3000 };
  };

  const clearToastState = () => {
    toastState.value = null;
  };

  return {
    toastState,
    setToastState,
    clearToastState,
  };
};
