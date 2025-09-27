"use client";

import { useEffect } from "react";

export default function ScrollHandler() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      document.body.classList.add("scrolling");
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        document.body.classList.remove("scrolling");
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
