// "Hey AIsel" (said "Aysel") as an English recognizer tends to hear it. Letters may be split by spaces or punctuation.
const STRONG = ['aysel', 'aisel', 'eysel', 'aysell', 'aisell', 'eysell', 'aycel', 'aicel', 'aicell', 'ayşel', 'ajsel'];
const WEAK = ['easel', 'isel', 'icel', 'eisel', 'isell', 'icell', 'ysel', 'aysal', 'isal', 'asel', 'azel', 'aysil', 'eyesel', 'eyesell', 'iseal', 'iceel', 'icecell', 'isale', 'icesale', 'isail', 'icil', 'isil', 'eisell', 'aso', 'ayso', 'aysol', 'aysa', 'ayza', 'isol', 'esol', 'aysu', 'asel', 'asil', 'ayesha', 'aisha', 'isha', 'ezel', 'azul', 'asl', 'ays', 'iso', 'aiso', 'eiso', 'isso', 'ayso', 'ayzo', 'izo', 'eyeso', 'icso', 'aysso', 'ice o', 'i so', 'ayşe', 'ayse', 'aysa', 'ayşa', 'aysel'];

const flex = (word: string) => word.split('').join("[\\s'.,-]*");
// Turkish/Azerbaijani letters count as word characters for the boundaries below.
const WAKE_RE = new RegExp(
  `(?:\\b(?:hey|hay|he|hi|ey|eh|a)[\\s,]*(?:${[...STRONG, ...WEAK].map(flex).join('|')})|\\b(?:${STRONG.map(flex).join('|')}))\\b`,
  'i',
);

/** True when the transcript contains the wake phrase. */
export function hasWakeWord(text: string) {
  return WAKE_RE.test(text);
}

/** The words spoken after the wake phrase, or the whole text when the phrase is absent. */
export function commandAfterWake(text: string) {
  const m = WAKE_RE.exec(text);
  if (!m) return text.trim();
  return text
    .slice(m.index + m[0].length)
    .replace(/^[\s,.!?]+/, '')
    .trim();
}

/** Drops a leading "hey <word>" the recognizer kept from the wake phrase in the same segment. */
export function dropWakePrefix(text: string) {
  return text.replace(/^\s*(?:hey|hay|hi)[\s,]+\S+[\s,.!?]*/i, '').trim();
}
