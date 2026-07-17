"use client";

import { useEffect } from "react";

const OLD_COPY = "$100 / $30 hourly unless quoted differently.";
const NEW_COPY = "$120 / $40 hourly unless quoted differently.";

function replaceOldPricingCopy() {
  document.querySelectorAll("p").forEach((paragraph) => {
    paragraph.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(OLD_COPY)) {
        node.textContent = node.textContent.replace(OLD_COPY, NEW_COPY);
      }
    });
  });
}

export function BookingPriceCopyFix() {
  useEffect(() => {
    replaceOldPricingCopy();

    const observer = new MutationObserver(replaceOldPricingCopy);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
