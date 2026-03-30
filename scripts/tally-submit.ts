/**
 * Submit Anvita Flow Early Access application to Tally.
 *
 * Usage:
 *   npx tsx scripts/tally-submit.ts '<JSON responses>'
 *
 * The argument is a JSON string whose keys are groupUuids and values are
 * the user's answers (strings for text fields, string[] for checkboxes).
 *
 * Example:
 *   npx tsx scripts/tally-submit.ts '{
 *     "8552e81c-ffc6-4014-8a8d-aa21caf041e6": "Alice",
 *     "42ca13b3-7433-4b01-8e07-18ea6f795b34": "alice@example.com",
 *     "b4b8aa4d-8678-4037-b296-bb002a2a001d": "https://github.com/alice",
 *     "a53f5125-931d-4fc8-b60c-c8c403cf406b": ["a985fd28-6bb2-4d8c-81d2-e23747c91f5b"],
 *     "37613d73-abef-4753-96c9-bfad203e7187": "Build AI agents",
 *     "43e59aef-58e6-4a27-b31d-3a24bc2f30d6": "",
 *     "0d0ebb74-8c09-4be4-a943-e6efb9dfde0f": ""
 *   }'
 */

import { randomUUID } from "crypto";

const FORM_ID = "44LEGX";
const ENDPOINT = `https://tally.so/api/forms/${FORM_ID}/respond`;

const raw = process.argv[2];
if (!raw) {
  console.error("Usage: npx tsx scripts/tally-submit.ts '<JSON responses>'");
  process.exit(1);
}

async function main() {
  const responses: Record<string, string | string[]> = JSON.parse(raw);

  const payload = {
    sessionUuid: randomUUID(),
    respondentUuid: randomUUID(),
    isCompleted: true,
    responses,
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.text();

  if (res.ok) {
    const data = JSON.parse(body);
    console.log(JSON.stringify({ success: true, submissionId: data.submissionId }));
  } else {
    console.error(JSON.stringify({ success: false, status: res.status, body }));
    process.exit(1);
  }
}

main();
