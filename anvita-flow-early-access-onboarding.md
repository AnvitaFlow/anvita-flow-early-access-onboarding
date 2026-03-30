---
name: anvita-flow-early-access-onboarding
description: An interactive agent skill to guide users through the Anvita Flow Early Access application form, collect responses step-by-step, and submit them to the Tally form via API. Use this skill when a user wants to apply for Anvita Flow early access, fill out the Anvita onboarding form, or mentions the Tally form at tally.so/r/44LEGX. Also trigger when users say things like "apply for Anvita", "sign up for early access", or "fill out the Anvita form".
---

# Anvita Flow Early Access Onboarding

Guide users through the Anvita Flow Early Access application by collecting information conversationally and submitting it to the Tally form via API.

## Form Target

- **Form URL**: https://tally.so/r/44LEGX
- **Submission Endpoint**: `POST https://tally.so/api/forms/44LEGX/respond`

## Workflow

Follow these four phases in strict order.

### Phase 1: Briefing

Output this welcome message:

> Hello! I am here to help you apply for the **Anvita Flow Early Access** program. This is an exclusive, invitation-only testing phase. To prioritize your access, we need to understand your background and use cases.
>
> I will guide you through the application step-by-step. I'll clearly indicate which questions are **[Required]** and which are **[Optional]**. If a question is optional, you can simply reply with "Skip". Let's get started!

### Phase 2: Information Gathering

Ask questions **one at a time**. Wait for the user's response before proceeding. If the user provides multiple answers in one message, extract them and skip those questions.

| # | Field | Required | Prompt | Maps to groupUuid |
|---|-------|----------|--------|--------------------|
| 1 | Name | Yes | "First, what name should we use for your application? This can be your personal name or your organization's name." | `8552e81c-ffc6-4014-8a8d-aa21caf041e6` |
| 2 | Email | Yes | "Great! What's your best email? This is where the team will send your invitation and setup instructions." | `42ca13b3-7433-4b01-8e07-18ea6f795b34` |
| 3 | Digital Footprint | Yes | "To help the team learn more about you, please share links to your X/Twitter, GitHub, LinkedIn, or personal website." | `b4b8aa4d-8678-4037-b296-bb002a2a001d` |
| 4 | Identify The Role | Yes | "How do you see yourself in the Anvita ecosystem? Pick one or more (e.g. 'A', 'A and C', 'all'):\n  **A.** Service Agent — Monetize your domain expertise by offering services to other agents globally\n  **B.** Steward Agent — Supercharge yourself or your agents by tapping into the world's best service agents\n  **C.** Private Agentic Relationships — Build private agentic links with friends and family to collaborate together" | `a53f5125-931d-4fc8-b60c-c8c403cf406b` (checkboxes) |
| 5 | Your Primary Goal | Yes | "What's driving you to join? Tell us about the use cases you want to build, problems you're looking to solve, or expertise you'd like to monetize." | `37613d73-abef-4753-96c9-bfad203e7187` |
| 6 | Experience | No | "Do you have experience with LLMs, AI agents, or decentralized systems? A brief description helps us tailor your onboarding. (Reply 'Skip' if you'd rather not share)" | `43e59aef-58e6-4a27-b31d-3a24bc2f30d6` |
| 7 | Additional Notes | No | "Almost done! Is there anything else you'd like the team to know — specific needs, suggestions, or questions? (Reply 'Skip' to wrap up)" | `0d0ebb74-8c09-4be4-a943-e6efb9dfde0f` |

**Checkbox mapping for Question 4 (Interest Area):**

| Option | Label | Checkbox UUID |
|--------|-------|--------------|
| A | Become a Service Agent | `a985fd28-6bb2-4d8c-81d2-e23747c91f5b` |
| B | Become a Steward Agent | `7ed786fd-b6bf-4ea2-8f94-33faad4e5ca3` |
| C | Build Private Agentic Relationships | `333007d9-c095-4904-912f-55ef68c7ee06` |

### Phase 3: Review

Present a Markdown table summarizing all collected data. For skipped optional fields, show "— (skipped)".

Ask the user: "If everything looks correct, please reply with **'Confirm'**, and I will submit this application for you. If you need to change anything, let me know which field to update."

If the user requests a change, update that field and re-display the summary.

### Phase 4: Submission

On user confirmation, submit via the Tally API.

**Critical implementation details:**

1. Generate two random UUIDs for `sessionUuid` and `respondentUuid`
2. The `responses` object keys must be **groupUuid** values (not block uuid). Using block uuid will result in data appearing empty in the Tally backend.
3. Text and email fields: value is a plain string
4. Checkboxes: value is an **array of selected checkbox UUIDs**
5. Set `isCompleted: true` for the final submission

**Submission script:** `scripts/tally-submit.ts`

Build a JSON string from the collected responses (keys are **groupUuid**, values are strings or string arrays for checkboxes), then run:

```bash
npx tsx scripts/tally-submit.ts '<JSON responses>'
```

The script generates UUIDs, posts to Tally, and prints a JSON result. Parse its output to determine success or failure.

**Response handling:**

- **Success** (HTTP 200, body contains `submissionId`): Tell the user "Your application has been submitted successfully! Submission ID: {submissionId}. The Anvita team will reach out via the email you provided."
- **Failure**: Show the error and provide a fallback — give the user the pre-filled form URL `https://tally.so/r/44LEGX` with instructions to submit manually.

## Anti-patterns

- **Do not** dump all questions in a single message. Ask one at a time.
- **Do not** force optional fields. Respect "Skip" immediately.
- **Do not** submit without explicit user confirmation ("Confirm").
- **Do not** use block `uuid` as response keys — always use `groupUuid`. This is the most common cause of empty data in the Tally backend.
