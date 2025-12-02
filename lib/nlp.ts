import { Candidate, Job, MatchResult } from "@/lib/types";

const STOPWORDS = new Set([
  "the","and","or","a","an","to","of","in","on","for","with","is","are",
  "as","by","be","at","from","this","that","it","its","we","our","their",
  "they","you","your","i","have","has","had","will","shall","can","could",
  "would","should"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.# ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// Simple "skills" heuristic
function extractSkills(text: string): string[] {
  const tokens = tokenize(text);
  const unique = Array.from(new Set(tokens));
  return unique;
}

type Vector = Record<string, number>;

function buildTfIdfVectors(job: Job, candidates: Candidate[]): {
  jobVec: Vector;
  candidateVecs: Record<string, Vector>;
} {
  const docs: { id: string; tokens: string[] }[] = [];

  const jobTokens = tokenize(job.description);
  docs.push({ id: `job-${job.id}`, tokens: jobTokens });

  candidates.forEach((c) => {
    docs.push({ id: c.id, tokens: tokenize(c.resumeText) });
  });

  const df: Record<string, number> = {};
  docs.forEach((doc) => {
    const unique = new Set(doc.tokens);
    unique.forEach((term) => {
      df[term] = (df[term] || 0) + 1;
    });
  });

  const N = docs.length;

  function tf(tokens: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    tokens.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
    const len = tokens.length || 1;
    Object.keys(counts).forEach((t) => {
      counts[t] = counts[t] / len;
    });
    return counts;
  }

  function tfidf(tokens: string[]): Vector {
    const tfVec = tf(tokens);
    const vec: Vector = {};
    Object.keys(tfVec).forEach((term) => {
      const idf = Math.log((N + 1) / ((df[term] || 0) + 1)) + 1;
      vec[term] = tfVec[term] * idf;
    });
    return vec;
  }

  const jobVec = tfidf(jobTokens);
  const candidateVecs: Record<string, Vector> = {};
  candidates.forEach((c) => {
    candidateVecs[c.id] = tfidf(tokenize(c.resumeText));
  });

  return { jobVec, candidateVecs };
}

function cosineSimilarity(a: Vector, b: Vector): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const terms = new Set([...Object.keys(a), ...Object.keys(b)]);
  terms.forEach((term) => {
    const va = a[term] || 0;
    const vb = b[term] || 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  });

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getMatchLabel(score: number): "Strong Match" | "Moderate Match" | "Weak Match" {
  if (score >= 0.8) return "Strong Match";
  if (score >= 0.6) return "Moderate Match";
  return "Weak Match";
}

function buildExplanation(
  label: "Strong Match" | "Moderate Match" | "Weak Match",
  overlappingSkills: string[],
  missingSkills: string[]
): string {
  const topOverlap = overlappingSkills.slice(0, 3);
  const topMissing = missingSkills.slice(0, 3);

  const overlapText =
    topOverlap.length > 0
      ? `overlap in ${topOverlap.join(", ")}`
      : "very little direct skill overlap with the job requirements";

  const missingText =
    topMissing.length > 0
      ? `key gaps around ${topMissing.join(", ")}`
      : "no major skill gaps for the listed requirements";

  if (label === "Strong Match") {
    return `Strong match due to solid ${overlapText}, with only ${missingText}.`;
  } else if (label === "Moderate Match") {
    return `Moderate match with some ${overlapText}, but ${missingText}.`;
  } else {
    return `Weak match — the resume shows ${overlapText}, but there are ${missingText}.`;
  }
}


export function computeMatches(job: Job, candidates: Candidate[]): MatchResult[] {
  const { jobVec, candidateVecs } = buildTfIdfVectors(job, candidates);
  const jobSkills = new Set(extractSkills(job.description));

  const results: MatchResult[] = candidates.map((c) => {
    const sim = cosineSimilarity(jobVec, candidateVecs[c.id] || {});
    const candSkills = new Set(extractSkills(c.resumeText));

    const overlappingSkills: string[] = [];
    const missingSkills: string[] = [];

    jobSkills.forEach((s) => {
      if (candSkills.has(s)) overlappingSkills.push(s);
      else missingSkills.push(s);
    });

        const label = getMatchLabel(sim);
    const explanation = buildExplanation(label, overlappingSkills, missingSkills);

    return {
      candidateId: c.id,
      candidateName: c.name,
      score: sim,
      overlappingSkills,
      missingSkills,
      matchLabel: label,
      explanation,
    };

  });

  results.sort((a, b) => b.score - a.score);

  return results;
}
