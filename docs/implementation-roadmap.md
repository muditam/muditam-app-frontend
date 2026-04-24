# Muditam App Roadmap (Priority 0 First)

## Scope
- Date: 2026-04-23
- Rule: Implement all `0` priority features first.
- Parallel track: Make entire app responsive on mobile + tablet + web.

## Phase 1: Foundation (Start Now)
- Responsive UI foundation for all tabs and key screens.
- Shared responsive utilities (`app/utils/responsive.js`).
- Remove hardcoded screen sizes and migrate to fluid breakpoints.

## Phase 2: Core Priority-0 Features
- Assigned health expert (1:1 chat + call).
- AI assistant for diabetes (Disha).
- Doctor/Dietitian call booking.
- Testimonials/member transformation stories.
- Step tracker.
- Supplement tracker.
- Glucometer photo upload with OCR glucose auto-read.
- Blood report upload.
- Blood test booking.
- Plate camera food recognition.
- Sugar reduction goal with HbA1c/fasting target + timeline.
- HbA1c target planner.
- Sugar reduction roadmap with weekly milestones.
- On-track/off-track indicator versus target.
- Daily water tracker with reminders.
- Supplement dosage tracker (name, dose, timing, streak).
- Smart reminders for supplement/medication.
- Redeem points on next Muditam order.

## Suggested Build Order (Priority-0)
1. Tracking + reminders data model (steps, supplements, reminders).
2. Goal engine (HbA1c targets, milestones, on/off-track status).
3. Expert care flows (assigned expert, booking, 1:1 chat/call).
4. AI assistant (Disha) with diabetes-focused guardrails.
5. Diagnostics uploads (blood reports + glucometer OCR).
6. Service commerce (blood test booking + points redemption).
7. Engagement surfaces (testimonials/stories + plate camera MVP).

## Technical Notes
- Keep all new features behind feature flags until QA sign-off.
- Use one shared design token set for spacing/typography to prevent future responsiveness regressions.
- Add screen-level responsive checks in QA for widths: `320`, `375`, `414`, `768`, `1024+`.

