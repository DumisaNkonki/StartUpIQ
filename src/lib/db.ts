import { Database } from "bun:sqlite";
import type { SubmissionData, EvaluationResult } from "./stages";

const DB_PATH = "data/startupiq.db";

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("node:fs");
    fs.mkdirSync("data", { recursive: true });

    db = new Database(DB_PATH);
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startup_name TEXT NOT NULL,
      founder_email TEXT,
      stage TEXT,
      description TEXT,
      url TEXT,
      raw_data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL REFERENCES submissions(id),
      detected_stage TEXT NOT NULL,
      stage_score INTEGER NOT NULL,
      overall_score INTEGER NOT NULL,
      dimension_scores TEXT NOT NULL,
      percentile REAL,
      report_json TEXT NOT NULL,
      model_version TEXT DEFAULT '1.0',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export function saveSubmission(data: SubmissionData): number {
  const d = getDb();
  const stmt = d.prepare(
    "INSERT INTO submissions (startup_name, founder_email, stage, description, url, raw_data) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(
    data.startupName,
    data.founderEmail ?? null,
    data.selfReportedStage ?? null,
    data.description ?? null,
    data.url ?? null,
    JSON.stringify(data)
  );
  return Number(result.lastInsertRowid);
}

export function saveEvaluation(
  submissionId: number,
  result: EvaluationResult
): number {
  const d = getDb();
  const stmt = d.prepare(
    "INSERT INTO evaluations (submission_id, detected_stage, stage_score, overall_score, dimension_scores, percentile, report_json, model_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const r = stmt.run(
    submissionId,
    result.detectedStage,
    result.stageScore,
    result.overallScore,
    JSON.stringify(result.dimensionScores),
    result.percentile ?? null,
    JSON.stringify(result),
    "1.0"
  );
  return Number(r.lastInsertRowid);
}

export function getEvaluationById(evaluationId: number): EvaluationResult | null {
  const d = getDb();
  const row = d
    .query("SELECT report_json FROM evaluations WHERE id = ?")
    .get(evaluationId) as { report_json: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.report_json) as EvaluationResult;
}

export function getEvaluationsBySubmission(
  submissionId: number
): EvaluationResult[] {
  const d = getDb();
  const rows = d
    .query(
      "SELECT report_json FROM evaluations WHERE submission_id = ? ORDER BY created_at DESC"
    )
    .all(submissionId) as { report_json: string }[];
  return rows.map((r) => JSON.parse(r.report_json) as EvaluationResult);
}

export function getRecentEvaluations(limit = 20): EvaluationResult[] {
  const d = getDb();
  const rows = d
    .query(
      "SELECT report_json FROM evaluations ORDER BY created_at DESC LIMIT ?"
    )
    .all(limit) as { report_json: string }[];
  return rows.map((r) => JSON.parse(r.report_json) as EvaluationResult);
}
