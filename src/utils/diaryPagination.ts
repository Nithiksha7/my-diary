/**
 * DOM-based pagination engine for My Diary physical notebook pages.
 * Accurately measures rendered text lines in a hidden DOM element
 * matching the notebook typography, line-height, and padding.
 */

export interface PageSlice {
  pageIndex: number;
  text: string;
  startIndex: number;
  endIndex: number;
}

let measureContainer: HTMLDivElement | null = null;

function getOrCreateMeasureElement(): HTMLDivElement {
  if (typeof document === 'undefined') {
    throw new Error('DOM measurement is only available in browser environments');
  }

  if (measureContainer && document.body.contains(measureContainer)) {
    return measureContainer;
  }

  const el = document.createElement('div');
  el.id = 'diary-pagination-measurer';
  el.style.position = 'absolute';
  el.style.top = '-99999px';
  el.style.left = '-99999px';
  el.style.visibility = 'hidden';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '-1000';
  el.style.opacity = '0';
  el.style.overflow = 'hidden';
  el.style.whiteSpace = 'pre-wrap';
  el.style.wordBreak = 'break-word';
  el.style.overflowWrap = 'break-word';
  el.style.boxSizing = 'border-box';
  el.style.paddingTop = '2px';
  el.style.paddingLeft = '2px';
  el.style.paddingRight = '0px';
  el.style.paddingBottom = '0px';
  el.style.border = 'none';
  el.style.margin = '0';
  el.style.fontFamily = "'Newsreader', Georgia, serif";
  el.style.fontStyle = 'italic';
  el.style.fontSize = '1.125rem'; // 18px
  el.style.lineHeight = '36px';
  el.style.letterSpacing = '0.015em';

  document.body.appendChild(el);
  measureContainer = el;
  return measureContainer;
}

/**
 * Measures the exact number of rendered visual lines a text string occupies
 * when rendered inside a container of the given width in pixels.
 */
export function measureTextLines(
  text: string,
  width: number,
  lineHeight: number = 36
): number {
  if (!text || text.length === 0) return 0;
  if (width <= 0) return 1;

  if (typeof document === 'undefined') {
    // SSR fallback estimation
    const avgCharsPerLine = Math.max(20, Math.floor(width / 8.5));
    const lines = text.split('\n');
    let total = 0;
    for (const l of lines) {
      total += Math.max(1, Math.ceil(l.length / avgCharsPerLine));
    }
    return total;
  }

  const el = getOrCreateMeasureElement();
  el.style.width = `${width}px`;

  // Append a zero-width space if text ends in newline to preserve trailing empty line height
  el.textContent = text.endsWith('\n') ? text + '\u200B' : text;

  const scrollHeight = el.scrollHeight;
  const contentHeight = Math.max(0, scrollHeight - 2); // Subtract 2px paddingTop
  return Math.max(1, Math.round(contentHeight / lineHeight));
}

/**
 * Paginates continuous full text into discrete physical pages based on real rendered dimensions.
 * Slices fullContent into PageSlice objects using binary search on candidate word/newline boundaries
 * so each page fills all usable ruled lines before overflowing to the next page.
 */
export function paginateContentByDimensions(
  fullContent: string,
  containerWidth: number,
  maxLines: number = 14,
  lineHeight: number = 36
): PageSlice[] {
  if (!fullContent || fullContent.length === 0) {
    return [{ pageIndex: 0, text: '', startIndex: 0, endIndex: 0 }];
  }

  // Use a fallback width if container has not mounted yet
  const effectiveWidth = containerWidth > 0 ? containerWidth : 600;

  // If the entire text fits on a single page, return a single slice
  if (containerWidth > 0 && measureTextLines(fullContent, effectiveWidth, lineHeight) <= maxLines) {
    return [{ pageIndex: 0, text: fullContent, startIndex: 0, endIndex: fullContent.length }];
  }

  const slices: PageSlice[] = [];
  let currentStartIndex = 0;
  const totalLen = fullContent.length;
  let pageIndex = 0;

  while (currentStartIndex < totalLen) {
    const remainingText = fullContent.substring(currentStartIndex);

    // If remaining text fits on the current page, finish
    if (containerWidth > 0 && measureTextLines(remainingText, effectiveWidth, lineHeight) <= maxLines) {
      slices.push({
        pageIndex,
        text: remainingText,
        startIndex: currentStartIndex,
        endIndex: totalLen,
      });
      break;
    }

    // Find all candidate split positions in remainingText (newlines, whitespace, punctuation)
    const splitPoints: number[] = [0];
    for (let i = 0; i < remainingText.length; i++) {
      const char = remainingText[i];
      if (char === '\n' || char === ' ' || char === '\t' || char === '—' || char === '-') {
        splitPoints.push(i + 1);
      }
    }
    if (splitPoints[splitPoints.length - 1] !== remainingText.length) {
      splitPoints.push(remainingText.length);
    }

    // Binary search for the maximum split point that fits within maxLines
    let low = 1;
    let high = splitPoints.length - 1;
    let bestSplitIndex = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidateSub = remainingText.substring(0, splitPoints[mid]);
      const lines = measureTextLines(candidateSub, effectiveWidth, lineHeight);

      if (lines <= maxLines) {
        bestSplitIndex = mid;
        low = mid + 1; // Try fitting more text
      } else {
        high = mid - 1; // Exceeds line capacity
      }
    }

    let sliceEndInRemaining = splitPoints[bestSplitIndex];

    // If even the first word/token exceeds maxLines (e.g. unbroken 300-char string)
    if (sliceEndInRemaining === 0) {
      let charLow = 1;
      let charHigh = Math.min(remainingText.length, splitPoints[1] || remainingText.length);
      let bestChar = 1;

      while (charLow <= charHigh) {
        const charMid = Math.floor((charLow + charHigh) / 2);
        const candidateCharSub = remainingText.substring(0, charMid);
        if (measureTextLines(candidateCharSub, effectiveWidth, lineHeight) <= maxLines) {
          bestChar = charMid;
          charLow = charMid + 1;
        } else {
          charHigh = charMid - 1;
        }
      }
      sliceEndInRemaining = bestChar;
    }

    const pageText = remainingText.substring(0, sliceEndInRemaining);
    slices.push({
      pageIndex,
      text: pageText,
      startIndex: currentStartIndex,
      endIndex: currentStartIndex + sliceEndInRemaining,
    });

    currentStartIndex += sliceEndInRemaining;
    pageIndex++;
  }

  return slices.length > 0
    ? slices
    : [{ pageIndex: 0, text: '', startIndex: 0, endIndex: 0 }];
}

/**
 * Maps a global character index in fullContent to a specific pageIndex and localIndex
 * within that page's slice.
 */
export function findPageForGlobalIndex(
  slices: PageSlice[],
  globalIndex: number,
  preferredPageIndex?: number
): { pageIndex: number; localIndex: number } {
  if (!slices || slices.length === 0) {
    return { pageIndex: 0, localIndex: 0 };
  }

  const clampedGlobal = Math.max(0, globalIndex);

  // If a preferred page index was provided and contains the index, prioritize it
  if (
    preferredPageIndex !== undefined &&
    preferredPageIndex >= 0 &&
    preferredPageIndex < slices.length
  ) {
    const prefSlice = slices[preferredPageIndex];
    if (clampedGlobal >= prefSlice.startIndex && clampedGlobal <= prefSlice.endIndex) {
      return {
        pageIndex: preferredPageIndex,
        localIndex: clampedGlobal - prefSlice.startIndex,
      };
    }
  }

  // Iterate through slices to find the containing page
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    if (clampedGlobal >= slice.startIndex && clampedGlobal < slice.endIndex) {
      return {
        pageIndex: i,
        localIndex: clampedGlobal - slice.startIndex,
      };
    }
    // If cursor is exactly at slice.endIndex
    if (clampedGlobal === slice.endIndex) {
      // If there is a subsequent slice and preferred was next page, pick next page
      if (i < slices.length - 1 && preferredPageIndex === i + 1) {
        return { pageIndex: i + 1, localIndex: 0 };
      }
      return { pageIndex: i, localIndex: slice.text.length };
    }
  }

  // If index is beyond all slices, place at the very end of the last slice
  const lastIdx = slices.length - 1;
  const lastSlice = slices[lastIdx];
  return {
    pageIndex: lastIdx,
    localIndex: lastSlice ? lastSlice.text.length : 0,
  };
}

