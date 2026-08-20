export type FormatKind =
  | "bold"
  | "italic"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "code"
  | "link";

export type ActiveFormats = Record<FormatKind, boolean>;

export type EditResult = {
  next: string;
  selectionStart: number;
  selectionEnd: number;
};

export const EMPTY_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  heading: false,
  bulletList: false,
  orderedList: false,
  code: false,
  link: false,
};

const MD_PREFIX = /^(?:#{1,6} |\d+\. |- |\* )/;
const HEADING_PREFIX = /^(?:#{1,6} )/;
const BULLET_PREFIX = /^(?:- |\* )/;
const ORDERED_PREFIX = /^(?:\d+\. )/;

const isWordChar = (char: string | undefined) =>
  !!char && /[A-Za-z0-9]/.test(char);

const lineBounds = (value: string, index: number) => {
  const start = value.lastIndexOf("\n", index - 1) + 1;
  const nextBreak = value.indexOf("\n", index);
  const end = nextBreak === -1 ? value.length : nextBreak;
  return { start, end, text: value.slice(start, end) };
};

const blockBounds = (value: string, start: number, end: number) => {
  const from = lineBounds(value, start).start;
  const to = lineBounds(value, Math.max(start, end - (end > start ? 1 : 0)))
    .end;
  return { from, to, block: value.slice(from, to) };
};

const splitIndent = (line: string) => {
  const match = line.match(/^(\s*)(.*)$/);
  return { indent: match?.[1] ?? "", content: match?.[2] ?? "" };
};

const isOpenUnderscore = (line: string, index: number) => {
  if (line[index] !== "_") return false;
  if (line[index + 1] === "_" || (index > 0 && line[index - 1] === "_")) {
    return false;
  }
  return !isWordChar(line[index - 1]);
};

const isCloseUnderscore = (line: string, index: number) => {
  if (line[index] !== "_") return false;
  if (line[index + 1] === "_" || (index > 0 && line[index - 1] === "_")) {
    return false;
  }
  return !isWordChar(line[index + 1]);
};

const findMarkerPairs = (line: string, marker: string) => {
  const pairs: Array<{ open: number; close: number }> = [];
  let index = 0;

  while (index <= line.length - marker.length) {
    const isOpen =
      marker === "_"
        ? isOpenUnderscore(line, index)
        : line.startsWith(marker, index);

    if (!isOpen) {
      index += 1;
      continue;
    }

    let close = -1;
    let search = index + marker.length;
    while (search <= line.length - marker.length) {
      const isClose =
        marker === "_"
          ? isCloseUnderscore(line, search)
          : line.startsWith(marker, search);
      if (isClose) {
        close = search;
        break;
      }
      search += 1;
    }

    if (close === -1) break;
    pairs.push({ open: index, close });
    index = close + marker.length;
  }

  return pairs;
};

const findInlineWrap = (
  value: string,
  start: number,
  end: number,
  marker: string,
): { open: number; close: number } | null => {
  const { start: lineStart, end: lineEnd } = lineBounds(value, start);
  if (end > lineEnd) return null;

  const pairs = findMarkerPairs(value.slice(lineStart, lineEnd), marker);

  for (const pair of pairs) {
    const open = lineStart + pair.open;
    const close = lineStart + pair.close;
    const wrapEnd = close + marker.length;
    const caretOutside =
      start === end && (start <= open || start >= wrapEnd);

    if (start >= open && end <= wrapEnd && !caretOutside) {
      return { open, close };
    }
  }

  return null;
};

const findLinkWrap = (
  value: string,
  start: number,
  end: number,
): {
  open: number;
  close: number;
  innerStart: number;
  innerEnd: number;
} | null => {
  const { start: lineStart, end: lineEnd, text } = lineBounds(value, start);
  if (end > lineEnd) return null;

  const pattern = /\[([^\]]*)\]\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    const open = lineStart + match.index;
    const close = open + match[0].length;
    const innerStart = open + 1;
    const innerEnd = innerStart + match[1].length;
    const caretOutside = start === end && (start <= open || start >= close);

    if (start >= open && end <= close && !caretOutside) {
      return { open, close, innerStart, innerEnd };
    }
  }

  return null;
};

const lineKind = (
  line: string,
): "heading" | "bulletList" | "orderedList" | null => {
  const content = splitIndent(line).content;
  if (HEADING_PREFIX.test(content)) return "heading";
  if (ORDERED_PREFIX.test(content)) return "orderedList";
  if (BULLET_PREFIX.test(content)) return "bulletList";
  return null;
};

export const detectFormats = (
  value: string,
  start: number,
  end: number,
): ActiveFormats => {
  const safeStart = Math.min(Math.max(0, start), value.length);
  const safeEnd = Math.min(Math.max(0, end), value.length);
  const lines = blockBounds(value, safeStart, safeEnd).block.split("\n");
  const kinds = lines.map(lineKind);

  return {
    bold: !!findInlineWrap(value, safeStart, safeEnd, "**"),
    italic: !!findInlineWrap(value, safeStart, safeEnd, "_"),
    code: !!findInlineWrap(value, safeStart, safeEnd, "`"),
    link: !!findLinkWrap(value, safeStart, safeEnd),
    heading: kinds.length > 0 && kinds.every((kind) => kind === "heading"),
    bulletList:
      kinds.length > 0 && kinds.every((kind) => kind === "bulletList"),
    orderedList:
      kinds.length > 0 && kinds.every((kind) => kind === "orderedList"),
  };
};

const unwrapInline = (
  value: string,
  start: number,
  end: number,
  marker: string,
): EditResult | null => {
  const wrap = findInlineWrap(value, start, end, marker);
  if (!wrap) return null;

  const contentStart = wrap.open + marker.length;
  const content = value.slice(contentStart, wrap.close);
  const next =
    value.slice(0, wrap.open) + content + value.slice(wrap.close + marker.length);

  const offset = start - contentStart;
  const length = Math.max(0, end - start);
  const selectionStart =
    wrap.open + Math.max(0, Math.min(offset, content.length));
  const selectionEnd =
    selectionStart +
    Math.min(length, content.length - (selectionStart - wrap.open));

  return { next, selectionStart, selectionEnd };
};

const unwrapLink = (
  value: string,
  start: number,
  end: number,
): EditResult | null => {
  const wrap = findLinkWrap(value, start, end);
  if (!wrap) return null;

  const label = value.slice(wrap.innerStart, wrap.innerEnd);
  const next = value.slice(0, wrap.open) + label + value.slice(wrap.close);
  return {
    next,
    selectionStart: wrap.open,
    selectionEnd: wrap.open + label.length,
  };
};

const mapBlockLines = (
  value: string,
  start: number,
  end: number,
  transform: (
    line: string,
    index: number,
  ) => { line: string; removedBefore: number },
): EditResult => {
  const { from, to, block } = blockBounds(value, start, end);
  const lines = block.split("\n");
  let pos = from;
  let removedBeforeStart = 0;
  let removedBeforeEnd = 0;

  const nextLines = lines.map((line, index) => {
    const lineStart = pos;
    const { line: nextLine, removedBefore } = transform(line, index);

    if (start >= lineStart) {
      const intoLine = start - lineStart;
      removedBeforeStart +=
        intoLine <= 0 ? 0 : Math.min(removedBefore, intoLine);
    }
    if (end >= lineStart) {
      const intoLine = end - lineStart;
      removedBeforeEnd += intoLine <= 0 ? 0 : Math.min(removedBefore, intoLine);
    }

    pos += line.length + 1;
    return nextLine;
  });

  const nextBlock = nextLines.join("\n");
  const next = value.slice(0, from) + nextBlock + value.slice(to);
  return {
    next,
    selectionStart: Math.max(from, start - removedBeforeStart),
    selectionEnd: Math.max(from, end - removedBeforeEnd),
  };
};

const unwrapLinePrefix = (
  value: string,
  start: number,
  end: number,
  kind: "heading" | "bulletList" | "orderedList",
): EditResult => {
  const pattern =
    kind === "heading"
      ? HEADING_PREFIX
      : kind === "orderedList"
        ? ORDERED_PREFIX
        : BULLET_PREFIX;

  return mapBlockLines(value, start, end, (line) => {
    const { indent, content } = splitIndent(line);
    if (!pattern.test(content)) {
      return { line, removedBefore: 0 };
    }
    const nextContent = content.replace(pattern, "");
    const stripped = content.length - nextContent.length;
    return { line: `${indent}${nextContent}`, removedBefore: stripped };
  });
};

const wrapLines = (
  value: string,
  start: number,
  end: number,
  kind: "heading" | "bulletList" | "orderedList",
): EditResult => {
  const { from, to, block } = blockBounds(value, start, end);
  const lines = block.split("\n");
  let pos = from;
  let shiftStart = 0;
  let shiftEnd = 0;

  const nextLines = lines.map((line, index) => {
    const lineStart = pos;
    const { indent, content } = splitIndent(line);
    const stripped = content.replace(MD_PREFIX, "");
    const prefix =
      kind === "heading"
        ? "## "
        : kind === "orderedList"
          ? `${index + 1}. `
          : "- ";
    const nextLine = `${indent}${prefix}${stripped}`;
    const oldPrefixLen = indent.length + (content.length - stripped.length);
    const newPrefixLen = indent.length + prefix.length;
    const delta = newPrefixLen - oldPrefixLen;

    if (start >= lineStart) {
      const intoLine = start - lineStart;
      if (intoLine <= oldPrefixLen) {
        shiftStart += newPrefixLen - Math.min(intoLine, oldPrefixLen);
      } else {
        shiftStart += delta;
      }
    }
    if (end >= lineStart) {
      const intoLine = end - lineStart;
      if (intoLine <= oldPrefixLen) {
        shiftEnd += newPrefixLen - Math.min(intoLine, oldPrefixLen);
      } else {
        shiftEnd += delta;
      }
    }

    pos += line.length + 1;
    return nextLine;
  });

  const nextBlock = nextLines.join("\n");
  const next = value.slice(0, from) + nextBlock + value.slice(to);

  if (start !== end && lines.length > 1) {
    const caret = from + nextBlock.length;
    return { next, selectionStart: caret, selectionEnd: caret };
  }

  const selectionStart = start + shiftStart;
  const selectionEnd = start === end ? selectionStart : end + shiftEnd;
  return { next, selectionStart, selectionEnd };
};

const wrapInline = (
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  kind: FormatKind,
): EditResult => {
  const selected = value.slice(start, end);

  if (kind === "link") {
    if (start !== end) {
      const inserted = `[${selected}](url)`;
      const urlStart = start + selected.length + 3;
      return {
        next: `${value.slice(0, start)}${inserted}${value.slice(end)}`,
        selectionStart: urlStart,
        selectionEnd: urlStart + 3,
      };
    }

    const inserted = "[](url)";
    return {
      next: `${value.slice(0, start)}${inserted}${value.slice(end)}`,
      selectionStart: start + 1,
      selectionEnd: start + 1,
    };
  }

  if (start !== end) {
    const inserted = `${before}${selected}${after}`;
    return {
      next: `${value.slice(0, start)}${inserted}${value.slice(end)}`,
      selectionStart: start + before.length,
      selectionEnd: start + before.length + selected.length,
    };
  }

  const inserted = `${before}${after}`;
  return {
    next: `${value.slice(0, start)}${inserted}${value.slice(end)}`,
    selectionStart: start + before.length,
    selectionEnd: start + before.length,
  };
};

export const toggleOrWrap = (
  value: string,
  start: number,
  end: number,
  kind: FormatKind,
): EditResult => {
  if (kind === "bold") {
    return (
      unwrapInline(value, start, end, "**") ??
      wrapInline(value, start, end, "**", "**", kind)
    );
  }
  if (kind === "italic") {
    return (
      unwrapInline(value, start, end, "_") ??
      wrapInline(value, start, end, "_", "_", kind)
    );
  }
  if (kind === "code") {
    return (
      unwrapInline(value, start, end, "`") ??
      wrapInline(value, start, end, "`", "`", kind)
    );
  }
  if (kind === "link") {
    return (
      unwrapLink(value, start, end) ??
      wrapInline(value, start, end, "[", "](url)", kind)
    );
  }

  const { block } = blockBounds(value, start, end);
  const lines = block.split("\n");
  const allSame =
    lines.length > 0 && lines.every((line) => lineKind(line) === kind);

  if (allSame) {
    return unwrapLinePrefix(value, start, end, kind);
  }

  return wrapLines(value, start, end, kind);
};

export const continueListOnEnter = (
  value: string,
  start: number,
  end: number,
): EditResult | null => {
  if (start !== end) return null;

  const { start: lineStart, text } = lineBounds(value, start);
  const { indent, content } = splitIndent(text);
  const bullet = content.match(/^(- |\* )(.*)$/);
  const ordered = content.match(/^(\d+)\. (.*)$/);
  const nextPrefix =
    bullet?.[1] ?? (ordered ? `${Number(ordered[1]) + 1}. ` : null);
  const rest = bullet?.[2] ?? ordered?.[2];

  if (!nextPrefix || rest === undefined) return null;

  const caretInLine = start - lineStart;
  const contentStart = indent.length;
  if (caretInLine < contentStart) return null;

  if (rest === "") {
    const next = `${value.slice(0, lineStart)}${value.slice(lineStart + text.length)}`;
    return { next, selectionStart: lineStart, selectionEnd: lineStart };
  }

  const markerLen = content.length - rest.length;
  const splitAt = Math.max(0, caretInLine - contentStart - markerLen);
  const before = rest.slice(0, splitAt);
  const after = rest.slice(splitAt);
  const currentPrefix = bullet?.[1] ?? `${ordered?.[1]}. `;
  const currentLine = `${indent}${currentPrefix}${before}`;
  const nextLine = `${indent}${nextPrefix}${after}`;
  const next = `${value.slice(0, lineStart)}${currentLine}\n${nextLine}${value.slice(lineStart + text.length)}`;
  const caret =
    lineStart + currentLine.length + 1 + indent.length + nextPrefix.length;
  return { next, selectionStart: caret, selectionEnd: caret };
};
