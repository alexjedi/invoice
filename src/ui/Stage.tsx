import { useLayoutEffect, useRef, useState } from "react";
import { Paper } from "./Paper";

const W = (210 / 25.4) * 96;
const H = (297 / 25.4) * 96;

export function Stage() {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useLayoutEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => {
      const narrow = window.innerWidth < 768;
      const s = el.clientWidth / W;
      setScale(narrow ? s : Math.min(s, el.clientHeight / H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="flex w-full items-start justify-center overflow-hidden md:min-h-0 md:flex-1 md:items-center">
      <div className="shrink-0 overflow-hidden rounded-sm shadow-pop" style={{ width: W * scale, height: H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          <Paper preview />
        </div>
      </div>
    </div>
  );
}
