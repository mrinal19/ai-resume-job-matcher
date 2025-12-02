"use client";

import { useState } from "react";
import { Candidate, Job, MatchResult } from "@/lib/types";

function labelClass(label: string) {
  if (label === "Strong Match") return "text-emerald-300 bg-emerald-500/10 border-emerald-500/40";
  if (label === "Moderate Match") return "text-amber-300 bg-amber-500/10 border-amber-500/40";
  return "text-rose-300 bg-rose-500/10 border-rose-500/40";
}

function barClass(label: string) {
  if (label === "Strong Match") return "bg-emerald-500";
  if (label === "Moderate Match") return "bg-amber-400";
  return "bg-rose-500";
}

export default function HomePage() {
  const [job, setJob] = useState<Job>({
    id: "job-1",
    title: "",
    description: "",
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateResume, setCandidateResume] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

    const loadSampleData = () => {
    setJob({
      id: "job-1",
      title: "Data Analyst – Fintech",
      description:
        "We are looking for a Data Analyst in a fintech company. Responsibilities include building dashboards, analysing transactional data, working with SQL, Python, Excel, and BI tools like Power BI or Tableau. Experience with statistics, A/B testing, ETL pipelines, and stakeholder communication is preferred.",
    });

    setCandidates([
      {
        id: "cand-1",
        name: "Alice Sharma",
        resumeText:
          "Data Analyst with 2+ years of experience. Strong in SQL, Python, Excel, Power BI, statistics, and dashboard building. Worked on customer transaction analysis, cohort analysis, and reporting for business teams.",
      },
      {
        id: "cand-2",
        name: "Rahul Verma",
        resumeText:
          "Software Engineer focusing on backend development. Experience in Java, Spring Boot, microservices, REST APIs, and Kubernetes. Some exposure to SQL and logging, but limited analytics/dashboards.",
      },
      {
        id: "cand-3",
        name: "Priya Singh",
        resumeText:
          "Business Analyst experienced in requirement gathering, documentation, and stakeholder management. Familiar with Excel, Google Sheets, and basic SQL. Comfortable with PowerPoint presentations and reporting.",
      },
    ]);

    setMatches([]);
  };


  const addCandidate = () => {
    if (!candidateName || !candidateResume) return;
    setCandidates((prev) => [
      ...prev,
      {
        id: `cand-${prev.length + 1}`,
        name: candidateName,
        resumeText: candidateResume,
      },
    ]);
    setCandidateName("");
    setCandidateResume("");
  };

  const handleMatch = async () => {
    if (!job.title || !job.description || candidates.length === 0) {
      alert("Please add a job description and at least one candidate.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, candidates }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert("Error computing matches");
        return;
      }

      setMatches(data.matches);
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Resume–Job Matcher</h1>
            <p className="text-sm text-slate-400">
              Paste a job description and resumes, get ranked matches + skill gaps.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
    <span className="text-xs border border-slate-700 px-3 py-1 rounded-full">
      Demo • NLP • TF-IDF • Next.js
    </span>
    <button
      onClick={loadSampleData}
      className="text-xs px-3 py-1 rounded-full border border-sky-500 hover:bg-sky-500/10"
    >
      Load sample job & candidates
    </button>
  </div>
</header>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Job Panel */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-lg font-semibold flex items-center justify-between">
              Job Description
              <span className="text-xs text-slate-400">Step 1</span>
            </h2>
            <input
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="Job Title (e.g., Data Analyst – Fintech)"
              value={job.title}
              onChange={(e) =>
                setJob((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <textarea
              className="w-full h-48 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500 resize-none"
              placeholder="Paste job description here (responsibilities, required skills, tech stack, etc.)"
              value={job.description}
              onChange={(e) =>
                setJob((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </section>

          {/* Candidates Panel */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-lg font-semibold flex items-center justify-between">
              Candidates / Resumes
              <span className="text-xs text-slate-400">Step 2</span>
            </h2>

            <div className="space-y-2 border border-slate-800 rounded-xl p-3">
              <input
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="Candidate Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
              <textarea
                className="w-full h-32 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                placeholder="Paste candidate's resume summary / skills / experience..."
                value={candidateResume}
                onChange={(e) => setCandidateResume(e.target.value)}
              />
              <button
                onClick={addCandidate}
                className="inline-flex items-center justify-center rounded-lg border border-emerald-500 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500/10"
              >
                + Add Candidate
              </button>
            </div>

            {candidates.length > 0 && (
              <div className="space-y-1 text-xs">
                <p className="text-slate-400">Added Candidates:</p>
                <ul className="flex flex-wrap gap-2">
                  {candidates.map((c) => (
                    <li
                      key={c.id}
                      className="px-2 py-1 rounded-full bg-slate-950 border border-slate-700"
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Run Matching */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Step 3: Run the engine to rank candidates, then inspect skill overlaps & gaps.
          </div>
          <button
            onClick={handleMatch}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Matching..." : "Run Matching Engine"}
          </button>
        </div>

        {/* Results */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Match Results</h2>
            {matches.length > 0 && (
              <span className="text-xs text-slate-400">
                Top score: {(matches[0].score * 100).toFixed(1)}%
              </span>
            )}
          </div>


          {matches.length === 0 ? (
            <p className="text-sm text-slate-500">
              No results yet. Add a job, add some candidates, then click{" "}
              <span className="font-semibold text-slate-200">
                Run Matching Engine
              </span>
              {matches.length > 0 && (
  <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
    <div className="font-semibold text-slate-100">
      Hiring Insight
    </div>
    <div className="mt-1">
      Best candidate:{" "}
      <span className="font-medium">
        {matches[0].candidateName}
      </span>{" "}
      with a score of{" "}
      <span className="font-medium">
        {(matches[0].score * 100).toFixed(1)}%
      </span>
      .
    </div>
  </div>
              )}
              .
            </p>
            
          ) : (
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                    <th className="text-left py-2 pr-4">Rank</th>
                    <th className="text-left py-2 pr-4">Candidate</th>
                    <th className="text-left py-2 pr-4">Match Score</th>
                    <th className="text-left py-2 pr-4">Overlapping Skills</th>
                    <th className="text-left py-2 pr-4">Missing Skills</th>
                    <th className="text-left py-2 pr-4">Explanation</th>

                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, idx) => (
                    <tr
                      key={m.candidateId}
                      className="border-b border-slate-800/60"
                    >
                      <td className="py-2 pr-4 align-top">#{idx + 1}</td>
                      <td className="py-2 pr-4 align-top">
                        <div className="font-medium">{m.candidateName}</div>
                        <div className="text-xs text-slate-500">
                          ID: {m.candidateId}
                        </div>
                      </td>
                      <td className="py-2 pr-4 align-top space-y-1">
  <div className="font-semibold">
    {(m.score * 100).toFixed(1)}%
  </div>
  <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
  <div
    className={`h-full ${barClass(m.matchLabel)}`}
    style={{ width: `${Math.min(m.score * 100, 100)}%` }}
  />
</div>

  <span
    className={
      "inline-flex mt-1 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium " +
      labelClass(m.matchLabel)
    }
  >
    {m.matchLabel}
  </span>
</td>

                      <td className="py-2 pr-4 align-top">
                        <div className="flex flex-wrap gap-1">
                          {m.overlappingSkills.slice(0, 10).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs"
                            >
                              {s}
                            </span>
                          ))}
                          {m.overlappingSkills.length === 0 && (
                            <span className="text-xs text-slate-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 align-top">
                        <div className="flex flex-wrap gap-1">
                          {m.missingSkills.slice(0, 10).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-xs"
                            >
                              {s}
                            </span>
                          ))}
                          {m.missingSkills.length === 0 && (
                            <span className="text-xs text-slate-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 align-top">
  <p className="text-xs text-slate-400 leading-snug max-w-xs">
    {m.explanation}
  </p>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
