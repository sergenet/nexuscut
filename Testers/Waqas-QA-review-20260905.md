# NexusCut QA review — Waqas Ahmad

Reviewed September 5, 2026 from `NexusCut - QA_Waqas.webm` (approximately
47 minutes, Windows 11, Chrome 152, 1920×1080 recording). This report is an
independent review of the evidence in the recording. It is not a claim that
every observation has been reproduced on another machine.

## Outcome

The tester completed import, timeline edits, captions, text, voiceover,
Save/Load, export, and Smart Cut attempts. The ordinary export completed and
played, but the saved-project workflow failed to preserve/recover the recorded
voiceover, and Smart Cut rejected two MP4 attempts. Those are the two most
important findings.

## Priority findings

### P0 — Recorded voiceover cannot be recovered after Save/Load and blocks export

- Evidence: approximately 33:07–37:20.
- The tester recorded `Voiceover 1` inside NexusCut, saved the project, reopened
  it in an incognito session, loaded the saved project, and relinked the original
  imported MP4.
- NexusCut then warned that both the original MP4 and `Voiceover 1` were missing.
  The original MP4 could be relinked; the tester had no external voiceover file
  to relink because it was created inside NexusCut.
- Export failed with the message that the original video for `Voiceover 1` was
  unavailable. Deleting the voiceover allowed export to proceed.
- Impact: a user can lose an in-app recording after following the advertised
  Save Local → Load Local workflow and may be unable to export the project.
- Required behavior: either embed recorded audio in the saved project package,
  persist it in durable local storage and restore it, or download a clearly
  named voiceover media file at recording time and provide an explicit relink
  path. Save must warn before succeeding if a required asset will not be restorable.

### P1 — Smart Cut rejects valid MP4 clips containing audio

- Evidence: approximately 38:46–42:05.
- The tester imported an MP4 screen/camera recording with spoken audio and
  deliberate pauses. Smart Cut displayed: “Smart Cut could not analyze this
  clip. Please try again with an MP4 or WebM video that contains audio.”
- He showed Windows identifying the file as an MP4 and repeated the test. A
  second MP4 attempt also produced the same error.
- Impact: the named feature cannot be evaluated or used in this environment.
- Required diagnostic improvement: the error must distinguish unsupported
  audio codec, audio decoding failure, no detectable audio stream, analysis API
  failure, and genuinely silent media. Log container, video codec, audio codec,
  sample rate, channel count, duration, request status, and server error ID.

### P1 — Adding a headline can target the selected caption instead

- Evidence: approximately 25:30–28:25.
- With a caption selected, the tester clicked Headline and believed the caption
  content was selected/modified rather than a distinct headline being created.
  After clearing selection, Subtitle created a separate text item as expected.
- Impact: an existing caption may be unintentionally overwritten when a user
  intends to create a new text layer.
- Verify before repair: reproduce with a generated caption selected, click each
  Text preset, and confirm a new independently selectable timeline item is added
  without mutating the caption.

### P1 — Exported text layout differs from the editor preview

- Evidence: approximately 44:01–46:30.
- The ordinary export downloaded and played successfully. Video, captions,
  muted source audio, and added text were present.
- The tester reported that the added text did not wrap to the next line as it
  appeared/intended in the editor; part of the phrase was positioned to the
  right. Subtitle/caption vertical placement also appeared different between
  preview and export.
- Impact: users cannot trust preview composition for text.
- Required test: create multiline headline, subtitle, and body text near each
  canvas edge at 9:16; compare preview pixel bounds with 540p and higher-quality
  exports. Test explicit newlines and automatic wrapping separately.

### P2 — Preview stalls or blanks after split/undo and a split boundary appears to blink

- Evidence: approximately 05:45–10:35.
- The tester repeatedly observed the preview disappear for several seconds
  after Split and Undo/Redo while thumbnails also loaded slowly. He reported a
  visible/audio discontinuity while previewing the split boundary.
- The final exported video was described as complete; the recording did not
  conclusively prove that the split-boundary blink existed in the export.
- Treat as a preview/performance defect until an exported reproduction confirms
  media corruption. Profile media-element seeking, object URL recreation,
  thumbnail generation, and React state updates around split/undo.

## Usability findings

These matter, but they should not precede the data-loss/export and Smart Cut work.

1. **Top toolbar overflow** (00:00–02:00): important actions sit in a horizontal
   scrolling row. The tester accidentally scrolled it and temporarily lost the
   controls. The extra blank/secondary scroll area made the movement unclear.
2. **Onboarding wording mismatch** (02:00–03:30): “Click here to start” instructs
   the user to “Open Media,” but the first visible action is Import. Provide an
   Import button directly in the onboarding panel or use the exact UI label.
3. **Project name affordance** (10:40–11:30): `Project Name` resembles static text;
   its editable nature is not obvious.
4. **Caption discovery** (11:45–13:30): Auto Captions is under AI Magic and was
   not obvious to this new user. This is a discoverability observation, not proof
   that a right-click menu is required.
5. **Caption progress terminology** (13:30–19:30): “Uploading clip 1 of 1” was
   slow for a short source and created uncertainty about where media was sent.
   Use separate states such as “Preparing audio locally,” “Uploading audio for
   transcription,” and “Transcribing.” Include a privacy/help explanation.
6. **Completion browser alert** (approximately 19:20): transcription completion
   appeared as a blocking browser alert rather than an in-product notification.
7. **Timeline/caption vertical space** (19:30–23:30): caption items were low in a
   tall track stack and required scrolling; the tester wanted a vertically
   resizable timeline.
8. **Text manipulation** (28:30–29:30): he expected direct drag positioning on
   the canvas rather than relying only on property controls.
9. **Audio controls are difficult to discover** (30:45–32:00): source-video mute
   worked once found, but the control was not obvious.
10. **Load labels are confusing** (35:45–36:45): both “Load project” and “Load
    Local” appeared without a clear explanation of the difference.
11. **Export status wording** (37:20–38:45): “Uploading your original video” was
    interpreted as rendering/processing and created another privacy concern.
12. **Editing during export** (43:35–44:00): the message says the user can keep
    editing, but does not explain whether subsequent changes belong to the active
    export. Say that export uses a snapshot taken when Start Export was clicked.

## Verified successes

- Media import and adding media to the timeline worked.
- Split and delete worked, despite slow preview recovery.
- Auto Captions eventually completed across the edited timeline, and a word
  could be edited.
- Caption style/color/position controls worked once discovered.
- Subtitle creation and styling worked when no caption was selected.
- Voiceover recording and source-video muting worked in the active session.
- Save produced a local project file.
- After deleting the unrecoverable voiceover, export completed and downloaded.
- The exported file played and included video, captions, muting, and added text.

## Recommended repair order and gates

1. Preserve in-app voiceovers across Save Local → Load Local and verify export.
2. Diagnose/fix Smart Cut with the tester’s exact media characteristics; improve
   the error so the next failure is actionable.
3. Prevent Text presets from mutating a selected caption.
4. Make preview and export text wrapping/positioning deterministic.
5. Investigate split/undo preview stalls without changing working export timing.
6. Apply low-risk wording/onboarding/toolbar improvements after functional gates.

For each of steps 1–4, add a regression test and manually verify on the deployed
site before asking another independent tester. Do not request a free retest from
Waqas: the accepted offer explicitly excluded retesting.

## Evidence files

- Original recording: `C:\NexusCut\Testers\NexusCut - QA_Waqas.webm`
- Machine transcript: `C:\NexusCut\scratch\waqas-review-transcript.json`
- Contact sheet: `C:\NexusCut\scratch\waqas-review-contact-sheet.jpg`
- Timestamp frames: `C:\NexusCut\scratch\waqas-review-frames`

The machine transcript was used for navigation and may mishear words. Findings
were based on the recording sequence and inspected frames, not transcript wording alone.
