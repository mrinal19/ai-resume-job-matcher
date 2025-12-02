export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
}

export interface MatchResult {
  candidateId: string;
  candidateName: string;
  score: number;          // 0–1
  overlappingSkills: string[];
  missingSkills: string[];
  matchLabel: "Strong Match" | "Moderate Match" | "Weak Match";
  explanation: string;
}
