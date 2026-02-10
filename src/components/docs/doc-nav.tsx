"use client";

import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
}

const sections: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "navigation-flow", label: "Navigation Flow" },
  { id: "hex-types", label: "Hex Types" },
  { id: "edge-conditions", label: "Edge Conditions" },
  { id: "data-model", label: "Data Model" },
  { id: "example", label: "Example Walkthrough" },
];

export function DocNav() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:block sticky top-24 w-56 shrink-0 self-start">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        On this page
      </p>
      <ul className="space-y-1">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm py-1 px-3 rounded-md transition-colors ${
                activeId === id
                  ? "text-white bg-white/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
