import { useRef, useEffect } from "react";

export function ScrollAnimate({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-scale-in");
        entry.target.classList.remove("opacity-0");
        observer.unobserve(entry.target);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`opacity-0 transition-opacity ${className}`}>
      {children}
    </div>
  );
}
