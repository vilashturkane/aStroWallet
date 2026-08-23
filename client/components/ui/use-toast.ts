"use client";

import * as React from "react";
import type { ToastProps } from "./toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

let count = 0;
const genId = () => String(++count);

type State = { toasts: ToasterToast[] };
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function setState(next: State) {
  memoryState = next;
  listeners.forEach((l) => l(memoryState));
}

export function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  const dismiss = () =>
    setState({ toasts: memoryState.toasts.filter((t) => t.id !== id) });
  setState({
    toasts: [
      { ...props, id, onOpenChange: (open: boolean) => !open && dismiss() },
      ...memoryState.toasts,
    ].slice(0, 4),
  });
  setTimeout(dismiss, 4500);
  return { id, dismiss };
}

export function useToast() {
  const [state, setLocal] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setLocal);
    return () => {
      const i = listeners.indexOf(setLocal);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast };
}
