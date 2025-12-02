import { NextRequest, NextResponse } from "next/server";
import { computeMatches } from "@/lib/nlp";
import { Candidate, Job } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const job: Job = body.job;
    const candidates: Candidate[] = body.candidates;

    if (!job || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json(
        { error: "job and candidates are required" },
        { status: 400 }
      );
    }

    const matches = computeMatches(job, candidates);

    return NextResponse.json({ matches });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
