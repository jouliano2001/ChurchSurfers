import { useEffect, useRef } from "react";

export function useKeyboard() {
  const keys = useRef({ left: false, right: false, jump: false });

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || k === "a") keys.current.left = true;
      if (e.key === "ArrowRight" || k === "d") keys.current.right = true;
      if (e.key === "ArrowUp" || k === "w" || e.key === " ") keys.current.jump = true;
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || k === "a") keys.current.left = false;
      if (e.key === "ArrowRight" || k === "d") keys.current.right = false;
      if (e.key === "ArrowUp" || k === "w" || e.key === " ") keys.current.jump = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keys;
}
