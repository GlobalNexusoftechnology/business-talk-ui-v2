// lib/chat/renderMessage.tsx

import DOMPurify from "dompurify";

export const renderMessageHtml = (html: string) => {
  return {
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "a",
        "b",
        "strong",
        "i",
        "em",
        "u",
        "p",
        "div",
        "span",
        "br",
        "ul",
        "ol",
        "li"
      ],
      ALLOWED_ATTR: ["href", "target", "rel"]
    })
  };
};