// ============================================================
// StartupIQ — Email Sending Utility (Resend)
// ============================================================

import { Resend } from "resend";
import type { EvaluationResult } from "./stages";
import { STAGE_LABELS } from "./stages";

const SITE_URL = process.env.SITE_URL ?? "https://startupiq.ai";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — email sending disabled.");
    return null;
  }
  return new Resend(apiKey);
}

function buildEmailHtml(result: EvaluationResult): string {
  const {
    startupName,
    detectedStage,
    overallScore,
    scoreLabel,
    percentile,
    topStrengths,
    topWeaknesses,
    summary,
  } = result;

  const stageLabel = STAGE_LABELS[detectedStage] ?? detectedStage;

  const scoreColor =
    overallScore >= 85
      ? "#34d399"
      : overallScore >= 70
        ? "#4ade80"
        : overallScore >= 50
          ? "#facc15"
          : overallScore >= 30
            ? "#fb923c"
            : "#f87171";

  const strengthsHtml = topStrengths
    .map(
      (s) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #1f2937">
          <span style="color:#e5e7eb;font-size:14px;font-weight:500">${s.dimension}</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #1f2937;text-align:right">
          <span style="display:inline-block;background:rgba(52,211,153,0.1);color:#34d399;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:600">${s.score}/10</span>
        </td>
      </tr>
    `
    )
    .join("");

  const weaknessesHtml = topWeaknesses
    .map(
      (w) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #1f2937">
          <span style="color:#e5e7eb;font-size:14px;font-weight:500">${w.dimension}</span>
          <br />
          <span style="color:#9ca3af;font-size:12px">${w.recommendation}</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #1f2937;text-align:right">
          <span style="display:inline-block;background:rgba(251,146,60,0.1);color:#fb923c;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:600">${w.score}/10</span>
        </td>
      </tr>
    `
    )
    .join("");

  const ordinal =
    percentile % 10 === 1 && percentile !== 11
      ? "st"
      : percentile % 10 === 2 && percentile !== 12
        ? "nd"
        : percentile % 10 === 3 && percentile !== 13
          ? "rd"
          : "th";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030712;padding:30px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:16px;border:1px solid #1f2937;background-color:#0a0a0f;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center">
              <span style="font-size:20px;font-weight:700;color:#e5e7eb">
                <span style="color:#818cf8">Startup</span>IQ
              </span>
            </td>
          </tr>

          <!-- Score -->
          <tr>
            <td style="padding:24px 32px 0;text-align:center">
              <table width="120" cellpadding="0" cellspacing="0" style="margin:0 auto">
                <tr>
                  <td style="width:120px;height:120px;border-radius:50%;border:6px solid ${scoreColor};text-align:center;vertical-align:middle">
                    <span style="font-size:40px;font-weight:800;color:${scoreColor}">${overallScore}</span>
                  </td>
                </tr>
              </table>
              <h2 style="margin:16px 0 4px;font-size:22px;font-weight:700;color:#f9fafb">
                ${startupName}
              </h2>
              <p style="margin:0;font-size:15px;color:#9ca3af">
                ${stageLabel} Stage &middot; ${scoreLabel} &middot; ${percentile}${ordinal} Percentile
              </p>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:20px 32px 0">
              <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:16px">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#9ca3af">${summary}</p>
              </div>
            </td>
          </tr>

          <!-- Strengths -->
          <tr>
            <td style="padding:24px 32px 0">
              <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#34d399">Top Strengths</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #064e3b;border-radius:12px;overflow:hidden">
                ${strengthsHtml}
              </table>
            </td>
          </tr>

          <!-- Weaknesses -->
          <tr>
            <td style="padding:24px 32px 0">
              <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#fb923c">Areas to Improve</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #431407;border-radius:12px;overflow:hidden">
                ${weaknessesHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px 0;text-align:center">
              <a href="${SITE_URL}/results" style="display:inline-block;background:#4f46e5;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;padding:12px 32px">
                View Full Report
              </a>
              <p style="margin:12px 0 0;font-size:12px;color:#6b7280">
                For the complete dimensional breakdown and roadmap,
                <a href="${SITE_URL}/results" style="color:#818cf8;text-decoration:underline">visit your results page</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px;text-align:center;border-top:1px solid #1f2937;margin-top:24px">
              <p style="margin:0;font-size:12px;color:#4b5563">
                Powered by <a href="${SITE_URL}" style="color:#818cf8;text-decoration:none">StartupIQ</a> &mdash; AI-Powered Startup Intelligence
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendEvaluationEmail(
  email: string,
  result: EvaluationResult
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const fromEmail = process.env.FROM_EMAIL ?? "noreply@startupiq.ai";
  const subject = `Your StartupIQ Evaluation: ${result.startupName} scored ${result.overallScore}/100`;

  try {
    const { error } = await resend.emails.send({
      from: `StartupIQ <${fromEmail}>`,
      to: [email],
      subject,
      html: buildEmailHtml(result),
    });

    if (error) {
      console.error("Resend send error:", error);
      return false;
    }

    console.log(`Evaluation email sent to ${email} for "${result.startupName}"`);
    return true;
  } catch (err) {
    console.error("Failed to send evaluation email:", err);
    return false;
  }
}
