export interface FuzzyCandidate<T = string> {
  value: string;
  metadata: T;
}

export interface FuzzyMatchResult<T = string> {
  candidate: FuzzyCandidate<T>;
  score: number;
}

export function normalizeForMatch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const previous = new Array<number>(b.length + 1);
  const current = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j += 1) {
    previous[j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function tokenOverlapScore(a: string, b: string): number {
  const aTokens = new Set(a.split(/\s+/).filter(Boolean));
  const bTokens = new Set(b.split(/\s+/).filter(Boolean));

  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(aTokens.size, bTokens.size);
}

function similarityScore(query: string, candidate: string): number {
  if (!query || !candidate) {
    return 0;
  }

  if (query === candidate) {
    return 1;
  }

  if (query.includes(candidate) || candidate.includes(query)) {
    return 0.92;
  }

  const distance = levenshteinDistance(query, candidate);
  const editScore = 1 - distance / Math.max(query.length, candidate.length);
  const overlapScore = tokenOverlapScore(query, candidate);

  return Math.max(editScore, overlapScore);
}

export function fuzzyMatch<T>(
  input: string,
  candidates: Array<FuzzyCandidate<T>>,
  minScore = 0.7
): FuzzyMatchResult<T> | null {
  const query = normalizeForMatch(input);
  if (!query || candidates.length === 0) {
    return null;
  }

  let best: FuzzyMatchResult<T> | null = null;

  for (const candidate of candidates) {
    const candidateValue = normalizeForMatch(candidate.value);
    const score = similarityScore(query, candidateValue);

    if (score < minScore) {
      continue;
    }

    if (best === null || score > best.score) {
      best = { candidate, score };
    }
  }

  return best;
}
