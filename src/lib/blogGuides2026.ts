import type { BlogPostLike } from '@/lib/blogData';

/**
 * Twenty long-form guides added 2026-11-06 in four rounds, to give the blog
 * real depth.
 *
 * The site was rejected by AdSense for "low value content" while its median
 * post ran about 450 words. These are written as standalone answers — a reader
 * who never opens the editor should still get the whole method — because that
 * is what the rejection is actually about.
 *
 * Round one covers making one clip: podcast repurposing, safe zones, caption
 * readability, Shorts length, audio repair. Round two covers the work around
 * it: batching, export settings, file organisation, rights, publishing. Round
 * three covers capture, which is where most weak shorts are actually decided:
 * lighting, on-camera delivery, self-filming, screen capture, scripting. Round
 * four covers the commercial side: pricing, media kits, outreach, contract
 * terms and affiliate links.
 *
 * The rounds deliberately do not overlap in subject, so they compete for
 * different searches rather than each other.
 *
 * Kept in their own module so blogData.ts stays readable. The array is spread
 * into `blogPosts`, so the blog index, the sitemap and generateStaticParams all
 * pick them up without further wiring.
 */
export const guidePosts: BlogPostLike[] = [
  {
    slug: 'podcast-into-shorts',
    title: 'How to Turn One Podcast Into Ten Shorts',
    description:
      'A repeatable method for cutting a long podcast episode into ten vertical clips that stand on their own, from transcript-first selection to caption placement.',
    date: '2026-11-06',
    category: 'Workflow',
    content: `
# How to Turn One Podcast Into Ten Shorts

A two-hour conversation usually contains ten moments worth publishing on their own. The problem is rarely a shortage of material — it is that hunting for those moments by scrubbing a waveform is slow, and the clips that come out of a rushed hunt tend to start mid-thought, which is the fastest way to lose a viewer in the first second.

This is the method we use: select from the transcript rather than the timeline, cut for a cold open, reframe for vertical, and let captions carry the parts a viewer cannot hear clearly. It works for interview shows, solo commentary and panel recordings. It also works when the source is a webinar, a lecture or a livestream, because the shape of the problem is identical.

## Work from the transcript, not the waveform

The first pass should not involve watching anything. Transcribe the episode, then read it. Reading is roughly ten times faster than scrubbing, and text exposes structure that audio hides: a clean question, a punchy answer, a story that resolves in ninety seconds.

While you read, mark four things:

- **Complete thoughts.** A moment only works if it makes sense without the preceding twenty minutes. If a clip needs "as I was saying earlier" to land, it is not a clip yet.
- **The first sentence.** The opening line decides whether the clip is watchable. A sentence that starts with "So," "And," or "I mean" is a sentence you will need to cut into.
- **Emotional peaks.** Disagreement, surprise, a confession, a specific number that contradicts what everyone assumes. These survive the loss of context better than explanations do.
- **Natural exits.** The best clips end on a completed idea, not on the exhale before the next topic.

Aim to mark fifteen candidates and expect to publish ten. The five you drop are usually the ones that only feel strong because of what came before them.

## What makes a podcast moment survive on its own

Short-form video is consumed by people who did not choose your show. They arrive mid-scroll with no context and no obligation. That changes the selection criteria in three specific ways.

**Self-containment beats insight.** A brilliant observation that requires the previous four minutes is worth less than a decent observation that stands alone. When you have to choose, choose the one that needs no setup.

**A concrete noun beats an abstraction.** "Our churn dropped when we stopped discounting" survives. "Retention strategy matters" does not, no matter how well it was said.

**A face or a voice is not enough on its own.** Podcast clips work because of what is said, not because a camera is pointed at a microphone. If the audio alone would not stop you, the video will not either.

## Give every clip a cold open

The single most common mistake in podcast clips is starting where the interesting sentence starts. That sentence usually depends on the one before it, so the clip opens mid-clause and the viewer leaves.

Two fixes, both quick:

1. **Back up one sentence.** Start on the setup line, not the payoff. You lose two seconds and gain comprehension.
2. **Cut in on the question.** If the host asked something sharp, keep the question and trim it to its shortest form. A question is the cheapest context you can give a stranger.

Then check the first three seconds out of context. If a person who has never heard the show cannot tell what is being discussed, the clip needs a shorter on-screen title card or a different in-point. Captions help here: the opening line being legible is often enough to hold someone who joined mid-sentence.

## Reframe for vertical before you style anything

A two-person podcast recorded in 16:9 becomes a vertical clip with a lot of empty space. There are three workable layouts, and the choice should follow the content:

- **Stacked speakers.** Host on top, guest below. Best for genuine back-and-forth, because both faces stay visible and the eyelines read naturally.
- **Active speaker.** Cut between the person talking. Tighter, more energetic, and better for a single strong answer. It needs cuts on every speaker change or it feels static.
- **Speaker plus context.** One face occupying the top two thirds, with a short text block or a b-roll still below. Useful when the guest is describing something visual.

Whatever you choose, leave the bottom fifth of the frame and the right edge clear. Every short-form platform covers those areas with its own controls — captions, buttons, a progress bar — and text that sits there is text nobody reads. We cover the geometry in more detail in our guide to vertical video safe zones.

One more thing about framing: do not crop a wide shot to vertical by centring it. Podcast cameras are usually off-centre, so a centred crop puts the speaker's ear in the middle of the screen.

## Let captions carry the audio

Podcast audio is rarely broadcast quality. Room echo, a guest on a laptop microphone, overlapping speech — all of it is normal, and all of it is harder to follow on a phone speaker in a noisy room.

Word-level captions solve most of it. The words arrive as they are spoken, so a viewer who misses a phrase can read it a beat later. Two rules make the difference between captions that help and captions that distract:

- **Two lines maximum, and break at clause boundaries.** A caption that wraps mid-phrase forces the eye to jump.
- **Fix names, jargon and numbers before export.** Automatic transcription reliably mangles product names and figures, and a wrong number in a finance clip is worse than no clip.

Keep captions inside the safe area described above, and keep the active-word highlight subtle. A highlight that flashes on every word competes with the speaker's face for attention.

## Cut the audio first, then the picture

Editing a talking-head clip is mostly audio work. Do it in this order:

1. **Trim the handle at both ends.** Remove the breath before the first word and the room tone after the last one.
2. **Flatten the level.** If the host is loud and the guest is quiet, the clip will feel broken even when nothing is wrong with the picture.
3. **Remove the overlaps.** Conversation crosstalk reads as noise to someone who was not there.
4. **Only then look at the video.** Cut to the active speaker, add the layout, and leave the frames alone.

If you start with the picture you will cut on visual beats, and the result sounds like it was assembled from fragments.

## Batch the work, and name the clips properly

Ten clips made one at a time take ten times as long as ten clips made together, because the setup cost — importing, transcribing, learning the layout — is paid once per session rather than once per clip.

Two small habits that save hours later:

- **Name each clip after its claim, not its position.** "churn-discounting" is findable in three months; "clip-04-final-v2" is not.
- **Write the title while the transcript is open.** The line that makes the best title is usually already in the text, and it is much harder to find again later.

## A realistic publishing schedule

One episode should feed roughly two weeks of short-form output. A workable pattern:

- **Day one:** transcribe, read, mark fifteen candidates.
- **Day two:** cut and reframe the first five, publish one.
- **Day three:** cut the remaining five, publish one.
- **Days four to fourteen:** publish one every day or two, in the order that puts the strongest claim first.

Publishing them all at once wastes the only real advantage of a long source: you can sustain a daily cadence without recording anything new.

## Honest limits

None of this is automatic, and it is worth being clear about what software can and cannot do. NexusCut transcribes word by word, gives you a multitrack timeline, handles the vertical reframe and burns in editable captions. It does not decide which ninety seconds of a two-hour conversation are worth publishing — that judgement is the part of the job that stays human, and it is also the part that makes the clips good.

## Before you export, check these

- The clip makes sense to someone who has never heard the episode.
- The first sentence is complete, and it is not "so" or "and".
- Both faces are inside the frame, and neither is cropped at the ear.
- No text sits in the bottom fifth or against the right edge.
- Names, jargon and numbers in the captions are spelled the way they are actually spelled.
- The host is not twice as loud as the guest.
- The file is named after the claim it makes.
`,
  },
  {
    slug: 'vertical-video-safe-zones',
    title: 'Vertical Video Safe Zones: What Covers Your Video',
    description:
      'Where TikTok, Reels and Shorts draw their controls over a 9:16 video, how much of the frame that costs you, and a layout that survives every one of them.',
    date: '2026-11-05',
    category: 'Design',
    content: `
# Vertical Video Safe Zones: What Covers Your Video

Every vertical platform draws its own interface on top of your video. A caption sits near the bottom left, a column of buttons runs down the right, a progress bar hugs the bottom edge, and on some screens a header covers the top. None of it is part of the file you exported — and all of it hides your content when someone actually watches.

This is the most common avoidable mistake in short-form video: a beautifully set subtitle that ends up underneath the "Follow" button. The fix is planning the layout around the chrome instead of discovering the problem after posting.

## What actually overlaps your video

Four regions take damage, and they are the same four on every platform, in slightly different proportions:

- **The right edge.** A vertical stack of action buttons — like, comment, share, and usually a profile avatar with a follow control. It occupies roughly the rightmost 12 to 18 percent of the frame, from about a third of the way down to near the bottom.
- **The bottom fifth.** The creator's name, the caption text, a music ticker and a progress bar. On a video with a long description this area can grow upward, particularly while the description is expanded.
- **The top.** A tab bar or a "For You" header on some screens, plus a search icon. Usually shallow, but not always absent.
- **The very bottom strip.** A navigation bar on some devices, and the system gesture area on phones without one.

The exact pixel counts differ by device, app version and screen shape, and they change with app updates. Treat any specific number you read — including in this article — as a starting estimate, not a specification.

## The safe rectangle

A layout that survives all three major platforms:

- Keep the **central 70 percent of the width** free of essential text.
- Keep the **middle 60 percent of the height** free of essential text.
- Treat the bottom 20 percent and the right 15 percent as permanently occupied.
- Allow a 5 percent margin at the very top for a header.

That leaves a usable box roughly from 10 percent to 75 percent of the height and from 5 percent to 85 percent of the width. It sounds cramped. In practice it is enough for a face in the upper two thirds, a two-line caption at around 65 percent height, and a small logo.

## Why "just move it up" is not the whole answer

The obvious response is to push all text upward, and that creates a different problem: text competes with the subject. If a face occupies the top half and the caption sits immediately under the chin, the composition looks top-heavy and the caption reads as a label for the person rather than a subtitle of what they are saying.

The practical resolution is to plan the shot for it. Frame a talking head slightly high in the frame, with the eyeline around 35 to 40 percent from the top, and leave the lower third genuinely empty. Then the caption has somewhere to live that does not collide with either the face or the buttons.

## Captions: the one element people always misplace

Subtitle position is the most consequential safe-zone decision, because captions are on screen constantly.

For most vertical video, a caption anchored at 65 to 72 percent of the height, centred horizontally within the safe box, clears the bottom interface on all three platforms. Anything below 80 percent starts to interact with the creator name and the first line of the description. Anything above 60 percent crowds the chin.

Two related decisions:

- **Line length.** Two lines maximum. A caption that wraps to three lines pushes into the face above or the buttons beside it.
- **Width.** Cap the text box at about 65 to 70 percent of the frame width. Full-width captions run under the action buttons on the right, and a line that disappears behind an icon looks like a rendering bug.

## Logos and watermarks

Brand marks belong in the top area, but the top is not free either. A logo placed in the top-right corner collides with a search icon on some screens; a logo in the top-left collides with a back arrow. The safest position is top-centre or just below the header, at a small size, at moderate opacity.

Resist the temptation to place a watermark in a corner and call the layout finished. Corners are exactly where platform interfaces concentrate.

## Test on a phone, not in the editor preview

Most editors preview a clean frame with no interface at all, which is precisely the wrong preview. Two habits close the gap:

1. **Post to a private or draft state and watch it on the device.** Every platform has some way to preview before publishing. The seconds it costs are cheaper than reposting.
2. **Check with the description expanded.** The bottom overlay grows when text is long, and a caption that was clear at 75 percent height can vanish under a two-line description.

If you cannot preview, export a still of the frame and overlay rough rectangles for the four regions. Crude, but it catches the obvious collisions.

## Safe zones and the "one idea per screen" rule

Safe zones are a geometry problem, and geometry problems are easiest to solve when there is less on screen. Every element you add — a title card, a progress ticker, a second caption track, a stock b-roll window — competes for the same shrinking rectangle.

If a frame needs a title, a caption, a logo and a b-roll inset to make sense, the clip is doing too much. Cut one of them. The most common casualty should be the title, because the caption already carries the words.

## A five-minute template workflow

Once you have a layout that works, stop rebuilding it:

- Create one master project at 1080 by 1920.
- Place a face-cam layer in the upper two thirds.
- Place a caption layer at 68 percent height, two-line limit, 68 percent width.
- Place a logo in the top centre at 10 percent of frame width.
- Save it as a template and duplicate it per clip.

Then the only decisions left per clip are which seconds to use and what the words say. That is exactly where the creative effort belongs.

## The short version

Keep essential content inside the middle 70 percent of the width and between 10 and 75 percent of the height. Put captions at roughly two thirds down the frame, never across the right edge. Keep logos small and near the top centre. Preview on a phone before publishing, and assume the interface will grow rather than shrink.

Everything else is style. This part is arithmetic, and getting it wrong is the difference between a caption that reads and a caption that a share button eats.
`,
  },
  {
    slug: 'caption-readability-guide',
    title: 'How to Write Captions People Actually Read',
    description:
      'Characters per second, line breaks, contrast and the transcription errors that matter most: a practical readability standard for short-form captions.',
    date: '2026-11-04',
    category: 'Design',
    content: `
# How to Write Captions People Actually Read

Captions are not decoration. On a phone, in a noisy room, with the sound off by default on most feeds, they are the primary channel. A caption that arrives too fast, wraps badly, or sits at 30 percent contrast is a caption nobody finishes — and an unfinished caption is an unfinished video.

The good news is that readability is measurable. Four numbers cover most of it, and none of them require taste to apply.

## Start with characters per second

Reading speed for on-screen text is typically estimated at 15 to 20 characters per second for comfortable comprehension, with subtitling standards converging somewhere in that range. Below about 12 characters per second the text feels sluggish and out of sync with speech. Above about 20, viewers start skipping words, and once they skip they tend to stop reading entirely.

For short-form video the practical target is **15 to 17 characters per second**. It is slightly conservative on purpose: a viewer scrolling in a moving car, or reading in a second language, needs the margin.

The test is simple. Find the longest caption on screen, count its characters, and divide by how many seconds it is visible. If the answer is over 20, either the line is too long or it is on screen for too short a time.

## Line breaks are editorial decisions

Automatic line wrapping breaks wherever the box runs out of room, which is usually mid-phrase. That small failure costs real comprehension, because the eye treats each line as a unit and a line that ends in the middle of a clause forces a re-read.

Break captions at clause boundaries instead:

- Before a conjunction: "we tried that / but the audio was unusable".
- After a complete subject-verb-object unit.
- Before a prepositional phrase that qualifies the whole clause.
- Never between an article and its noun, or between a number and its unit.

Two lines, and prefer a shorter first line. A top-heavy caption reads as a block; a bottom-heavy one reads as a sentence continuing.

## Two lines, 32 to 42 characters

Three-line captions are the most common readability failure in short-form video, and they usually appear for a structural reason: the speaker said a long sentence and nobody split it.

Split it. A caption that occupies three lines at a large size either covers the subject's face or forces a smaller font size, and small text is worse than extra screens. The usable range is roughly 32 to 42 characters per line at a size that is legible on a 6-inch screen — which is really a statement about height, not width: a caption should be at least about 4 percent of the frame height per line.

## Word-by-word or sentence-level?

Both work, for different jobs.

**Word-by-word** — one or two words at a time, with the active word highlighted — is energetic and pairs well with fast, punchy delivery. It holds attention because the frame keeps changing. It struggles with long or complex sentences, because a viewer cannot look ahead.

**Sentence-level** — a full clause at a time — is calmer and better for explanation, story and anything with numbers, names or jargon.

A useful compromise, and the one most creators settle on, is short phrases of three to five words with the active word highlighted. It keeps the motion of word-by-word captions and the context of a full sentence.

## Contrast decides whether any of it is legible

A dark caption on a mid-tone background is invisible regardless of length. Three approaches, in order of robustness:

1. **A background plate.** A semi-transparent box behind the text. Ugly on some designs, unbeatable for readability, and the right choice for b-roll-heavy footage.
2. **Outline plus shadow.** A solid stroke of roughly 4 to 8 percent of the font size, plus a soft shadow. This is what most broadcast captions use, and it survives almost any background.
3. **A solid colour with no treatment.** Only safe when you control the background, which in short-form video you usually do not.

Check contrast against the brightest area of the frame behind the text, not the average. A white caption over a white shirt is a caption that disappears for two seconds.

## Caption the words, not every sound

There is a temptation to caption every "um", every laugh, every "(music)". For accessibility subtitles this is correct practice. For short-form video it is usually noise, and it inflates the character count you are trying to keep down.

The sensible line: caption all dialogue, drop filler sounds, and keep a sound description only when the sound is the point — a door slamming, a phone ringing, a room going silent.

## Fix the transcript where it matters

Automatic transcription fails predictably. Check these categories in this order:

- **Names of people, companies and products.** Most likely to be wrong, most likely to be noticed.
- **Numbers, prices and dates.** A wrong digit is a factual error, not a typo.
- **Jargon and acronyms.** Often transcribed phonetically into nonsense.
- **Homophones in context.** "Their" and "there", "principle" and "principal".

Everything else — a dropped filler word, one casing error — rarely changes meaning and is not worth the time before publishing.

## Reading speed is a property of the whole clip

A viewer who has to read ten captions in fifteen seconds is not watching a video any more; they are reading a document at speed. When a clip feels frantic even though the editing is calm, the cause is usually caption density, not cuts.

Two levers: remove words, or add time. Removing words means cutting a repeated phrase or a hedge — "I think that, basically, what we found was" becomes "what we found was". Adding time means leaving a beat of silence before the next caption, which also makes the clip feel less breathless.

## Accessibility is not a separate task

Captions written for readability are close to captions written for accessibility, with two additions worth making:

- **Speaker labels** when two people are on screen and the voices are similar.
- **Accurate timing**, so a viewer who is deaf can follow who said what, not just the words.

Everything else — two lines, sensible breaks, adequate contrast, corrected names — is shared between the two goals. There is no trade-off to manage here; the readable caption is the accessible one.

## A pass/fail check before export

- Longest caption is at or below 20 characters per second; most are 15 to 17.
- No caption exceeds two lines.
- No line break splits a clause, an article from its noun, or a number from its unit.
- The caption clears the platform interface: inside the middle 70 percent of the width, above the bottom 20 percent.
- Contrast is legible over the brightest background frame in the clip.
- Names, numbers and jargon are correct.
- Reading the captions alone tells you what the video says.

If all seven pass, the captions will do their job in a feed where nobody can hear you.
`,
  },
  {
    slug: 'how-long-should-a-youtube-short-be',
    title: 'How Long Should a YouTube Short Be?',
    description:
      'Length is a retention decision, not a ranking trick: three useful durations for short-form video, when to split a clip, and how to test length honestly.',
    date: '2026-11-03',
    category: 'Strategy',
    content: `
# How Long Should a YouTube Short Be?

This question usually comes with an expectation of a number. The honest answer is that the platform's maximum has changed more than once — Shorts began at a minute and has been extended since — so any guide quoting a fixed ceiling is probably out of date. Check the current limit in YouTube's own help pages, then forget about it, because the maximum is almost never the right length anyway.

Length is a decision about attention, not about what the platform permits.

## Why longer clips usually underperform

Short-form feeds optimise for completion. A viewer who watches a thirty-second clip to the end signals something different from a viewer who abandons a two-minute clip at forty seconds, even though both watched the same forty seconds. Longer video makes completion harder by arithmetic alone: to finish, someone has to stay twice as long.

That does not mean short is always better. A clip that ends before the idea lands gets abandoned too, just sooner. The useful question is not "how long should this be" but "what is the shortest version that still delivers the thing I promised in the first three seconds".

## Three durations that do different jobs

In practice, short-form video clusters into three lengths, each with its own purpose.

**Fifteen to twenty-five seconds: the single beat.** One claim, one demonstration, one punchline, one reaction. This length rewards a strong opening line and punishes any setup. It is the easiest length to complete and the hardest to make memorable, because there is no room for a turn.

**Thirty to forty-five seconds: the single idea with evidence.** A claim, a reason, an example. This is the workhorse length for tutorials, product demos and commentary, and it is roughly where a spoken paragraph fits comfortably.

**Sixty to ninety seconds: the short story.** Setup, complication, resolution. Useful for personal stories, case studies and anything where the shape of the narrative is the point. Completion rates drop here, so the opening has to be unusually strong.

Anything beyond that is usually two clips wearing one coat.

## When to split a clip instead of trimming it

If a clip needs three examples to make its point, that is not one ninety-second video. It is three thirty-second videos, each with one example, published across three days. You keep the argument intact, you triple the number of things you can post, and each piece gets its own chance in a feed.

The exception is a story whose power depends on accumulation — a build-up, a reveal, a payoff. Splitting that destroys it. Ask whether the parts work alone. If they do, split.

## The rule of one idea

Before touching a timeline, write the clip's claim as a single sentence. If the sentence needs an "and", the clip has two ideas and should be two clips.

This rule does more for retention than any editing trick, because a viewer can only hold one promise at a time. A clip that promises one thing and delivers it feels satisfying. A clip that promises three things and delivers two feels like it wasted the viewer's time, even though more happened.

## End on purpose, not on exhaustion

Two endings work, and they are opposites:

- **The loop.** The last frame flows into the first, so a viewer who reaches the end starts again without noticing. This inflates watch time and works best for visual or comedic clips.
- **The hard stop.** The clip ends on the strongest sentence, immediately after it. No outro, no "follow for more", no trailing laugh.

What does not work is drifting to a stop: the speaker finishes the thought, then says something that weakens it, then the clip ends. Those last four seconds cost you the completion you had already earned.

Cut at the peak. If the sentence sounds abrupt to you, it is probably exactly right — you have heard the material twenty times and the viewer has heard it once.

## How to test length honestly

You cannot A/B test the same clip at two lengths, because the shorter one is a different video. What you can do is compare across ideas:

- **Same topic, different lengths, different weeks.** Take a subject you have covered at forty-five seconds and make a twenty-second version with a different opening. Compare completion, not views.
- **Read the retention curve, not the headline number.** If most viewers leave in the first three seconds, length is not your problem — the opening is. If they leave at eighty percent, the ending is.
- **Watch your own clips on mute.** If you cannot follow the point without sound, the pacing is being carried by audio you will not have in a feed.

## What matters more than length

Three things, in order:

1. **The first three seconds.** A clear claim, stated or shown immediately. This determines almost everything downstream.
2. **The captions.** Most feeds autoplay muted; the words on screen are how the clip is understood.
3. **The framing.** Vertical, subject in the upper two thirds, text clear of the interface. A great clip cropped badly looks like an accident.

Length is fourth. Get the first three right and the length mostly chooses itself.

## A practical default

If you want a rule of thumb rather than a rule: **forty seconds**, one idea, one piece of evidence, ending on the strongest sentence. Then vary deliberately — cut a twenty-second version when the idea is a single beat, allow ninety when the story needs it, and split anything that needs a second "and".

The clip is the right length when removing anything else would break it. That is a better test than a stopwatch.
`,
  },
  {
    slug: 'fix-bad-audio-shorts',
    title: 'Fixing Bad Audio in Short-Form Video',
    description:
      'A practical repair order for phone-recorded audio: levels, rumble, noise, sibilance, music beds and silence trimming, plus what cannot be fixed.',
    date: '2026-11-02',
    category: 'Tutorial',
    content: `
# Fixing Bad Audio in Short-Form Video

Viewers forgive soft focus, a slightly crooked frame and a mediocre background. They do not forgive audio they have to strain to hear. In short-form video the tolerance is even lower, because the viewer has a thumb hovering and no investment in you yet.

Most phone-recorded audio has the same four defects, and they have a repair order. Doing them out of order is why amateur audio work often sounds worse after processing than before.

## Diagnose before you process

Listen once, on a phone speaker, at a normal volume. Then write down what is actually wrong. The usual suspects:

- **Too quiet.** You have to turn the phone up past halfway.
- **Clipped.** The loudest words crackle or distort; the waveform hits the ceiling.
- **Rumbly.** Air conditioning, traffic, handling noise, a table thump.
- **Hissy.** A constant high-frequency wash under the voice.
- **Uneven.** Loud laugh, quiet sentence, loud again.
- **Sibilant.** The "s" sounds pierce.
- **Muddy.** Voice sounds boxed, like it is coming through a wall.

Each has a different fix, and some are unfixable. Applying noise reduction to a clipping problem, which is the single most common mistake, removes detail and leaves the distortion in place.

## Step one: set the level

Work to a target rather than to taste. A commonly used target for streaming and social platforms is an integrated loudness around minus fourteen LUFS, with true peaks no higher than minus one decibel. Exact numbers matter less than consistency: if every clip in a series sits at the same loudness, the series feels professional and nobody can say why.

Two rules:

- **Normalise, do not simply amplify.** Normalisation to a target listens to the whole clip and raises it as a unit; amplifying by a fixed number of decibels will clip the loud parts.
- **If the source is already clipping, stop.** Clipping is distortion baked into the file. No amount of level work recovers it. Re-record, or accept it and move on.

## Step two: remove the low rumble

A high-pass filter — cutting everything below roughly 80 to 100 hertz — is the single highest-value move on phone audio. Almost nothing useful in a human voice lives down there, and almost all room noise does. The result is an immediately cleaner, less muddy sound with no audible change to the voice itself.

If the voice still sounds boxy after that, a gentle cut somewhere between 200 and 400 hertz can reduce the "recorded in a cupboard" quality. Small moves: minus two or three decibels, not minus ten.

## Step three: reduce noise gently, or not at all

Noise reduction is a trade. It removes hiss and hum, and it also removes the quiet detail that makes a voice sound present. Push it far enough and the result is the underwater, robotic texture everyone recognises from bad conference calls.

Practical guidance:

- Apply it **after** the high-pass filter, so it has less to work on.
- Aim to reduce the noise floor, not to eliminate it. A little room tone is natural; absolute silence between words sounds synthetic.
- Compare against the original at matched loudness. If the processed version sounds thinner and the noise is still audible, undo it.

For steady tonal noise — a fan hum at one frequency, mains hum — a narrow notch is far less damaging than broadband reduction.

## Step four: tame sibilance

Sharp "s" and "sh" sounds are exaggerated by phone microphones and by close placement. A de-esser, or a narrow cut around 5 to 8 kilohertz, fixes most of it.

Do not remove sibilance entirely. The difference between a voice with softened sibilance and one with none is the difference between a person and a text-to-speech engine. Aim for "not piercing" rather than "gone".

## Step five: build the music bed properly

Music under speech is where most amateur clips fall apart, in one of two directions: the music is so quiet it adds nothing, or it competes with the voice.

Two practical rules:

- **Duck the music under speech.** Around 18 to 22 decibels below the voice is a reasonable starting point; the voice should be unmistakably louder at every moment.
- **Give the music somewhere to be.** If the music is only ever a background wash, let it come up in the gaps — before the first word and after the last. That contrast is what makes a bed feel intentional.

Also check the licence. A track that gets a video muted by a rights system costs more than the clip was worth.

## Step six: trim silence without clipping the consonants

Cutting dead air tightens pacing, but automated silence removal has a predictable failure: it clips the tail of a word, so "right" becomes "righ". Listen to the first and last 200 milliseconds of every cut.

A workable compromise is to keep a short handle — a tenth of a second or so — on both sides of each cut, and to trim only gaps longer than about half a second. Silence shorter than that is pacing, not dead air.

## What cannot be fixed

Worth knowing, so you do not spend an hour on it:

- **Clipping.** Distortion is in the file.
- **Overlapping speech.** Two voices at once cannot be separated cleanly by a filter.
- **Heavy reverb in a large empty room.** De-reverb tools exist and all of them sound like they are working hard.
- **A microphone too far from the mouth.** Distance costs clarity, and no processing adds back what was never captured.

In those cases, the fix is the next recording, not this one.

## Record better next time, in four changes

1. **Get closer.** A phone held 15 to 20 centimetres from the mouth sounds dramatically better than one on a table a metre away.
2. **Soften the room.** A carpet, a curtain, a wardrobe full of clothes. Hard parallel walls are the enemy.
3. **Turn off the noise.** Air conditioning, fans, notifications, the fridge.
4. **Watch the meters.** Peaks should sit below the ceiling, not touching it.

Those four changes do more than any processing chain.

## Monitor on the worst speaker you own

Mix on a phone speaker, not on headphones, because that is the device most viewers will use. If the voice is clear and the music does not muddy it on a phone speaker, the mix works. Headphones hide exactly the problems that a phone speaker exposes.

Then check once more with the volume at about a third. If you can still follow every word, the clip is done.
`,
  },

  /* ---------------------------------------------------------------------
   * Round two, same day. A different cluster from round one: not how to cut
   * a single clip, but how to run the work around it - batching, export,
   * file organisation, rights, publishing. Deliberately kept away from
   * captions, hooks and per-niche editing so the two rounds do not compete
   * for the same queries.
   * ------------------------------------------------------------------- */
  {
    slug: 'batch-produce-shorts',
    title: 'How to Batch Produce a Week of Shorts in One Session',
    description:
      'A two-session weekly system for producing several shorts at once: one capture pass, one edit pass, and a review the next day.',
    date: '2026-11-06',
    category: 'Workflow',
    content: `
# How to Batch Produce a Week of Shorts in One Session

Most creators do not quit because they run out of ideas. They quit because producing one clip a day means opening the editor, loading footage, remembering where they left off, and closing it again five times a week. The editing itself might take twenty minutes; the context switching around it takes an hour.

Batching is the fix, but not in the way it is usually described. You do not want one enormous session where you record everything and edit everything. You want two shorter sessions that each do one kind of work: one where you capture raw material, and one where you cut it. A third, very short session the next day catches the mistakes the first two could not see.

This is the system, and it assumes you are one person with limited hours.

## Why switching costs more than editing

The expensive part of a five-clip week is not five times the cutting. It is five times the setup: finding the file, remembering the take you liked, re-establishing where the caption style lives, re-deciding the export settings.

Every one of those decisions is a small tax, and the tax is paid per session rather than per clip. Collapse five sessions into two and you pay it twice instead of five times. The clips do not get shorter to edit; the overhead around them mostly disappears.

There is a second benefit that matters more over months. Decisions made once and reused produce a consistent look. Decisions made fresh each day produce five clips that look like five different channels.

## Before you record, pick one constraint per batch

A batch needs to be narrow enough that the clips share a shape. Choose one constraint from each row and hold it for the whole batch:

- **One subject area.** Five clips about the same topic can share research, b-roll and captions. Five unrelated clips share nothing.
- **One format.** All talking head, all screen recording, all text-on-background. Mixing formats inside a batch reintroduces setup cost.
- **One target length.** Pick a window, such as 30 to 45 seconds, and stay inside it. Length variation is a per-clip decision that batching is meant to remove.
- **One opening device.** A question, a claim, a number, a mistake. Same device five times reads as a series rather than a scatter.

Write the five openings down as sentences before you record anything. Not outlines, sentences. The opening line is the hardest part of a short, and writing it while the camera is running is how you end up with five clips that all begin with "okay so".

## Session one: capture raw material

The capture session produces footage, not finished clips. Its only job is to get usable takes on disk with the names intact.

1. **Set up once.** Camera or screen, microphone, light, backdrop — set and leave. Do not adjust between takes.
2. **Record each opening twice.** One straight take, one with a different energy. Two takes per clip is enough; more takes is procrastination with a red light on.
3. **Do not stop for mistakes.** Restart the sentence, keep rolling, fix it in the edit. Stopping to perfect a take is how a one-hour session becomes three.
4. **Slate each take out loud.** Say the clip number and the take before you start. It saves the entire matching step later.
5. **Stop while you still have energy.** A batch recorded tired produces clips that sound tired, and no edit fixes that.

If you are working from an existing long recording — a podcast, a webinar, a livestream — this session becomes a selection session instead. Read the transcript and mark candidate moments rather than recording anything new. The method for that is in our guide to [turning one podcast into ten shorts](/blog/podcast-into-shorts).

## Session two: edit in passes, not per clip

This is the part most people get wrong. The instinct is to finish clip one completely, then start clip two. That means re-deciding caption style, font size, safe-zone position and export settings five separate times, and it means five separate chances to be inconsistent.

Instead, work in passes across the whole batch:

- **Pass one — selection.** For every clip, pick the take and trim the start and end. Nothing else. Rough is fine.
- **Pass two — structure.** Cut the dead air and any sentence that does not earn its place. This is where a batch gets faster, because after three clips you can hear the same filler pattern in all of them.
- **Pass three — captions.** Transcribe and style every clip in one sitting, using one style. Changing caption treatment between clips in a batch is the single most visible inconsistency.
- **Pass four — sound.** Levels, music bed if any, and the check described in [fixing bad audio](/blog/fix-bad-audio-shorts). Do this for all clips back to back and your ears calibrate to the batch rather than to one clip.
- **Pass five — export.** Every clip, one settings preset, one destination folder. This is the pass where a saved preset earns its keep.

Five passes over five clips is roughly the same editing work as five finished clips, done in a third of the elapsed time, because each pass uses one kind of attention.

## One project per clip, one folder per batch

It is tempting to keep a whole batch in a single project timeline, stacked end to end. Do not. A single timeline makes it impossible to export one clip again after a fix without re-deriving where it starts and ends, and it hides length problems.

Save one project file per clip, all inside one batch folder, named so the order is obvious when sorted alphabetically. A naming scheme that survives a year is covered in [how to organize video projects](/blog/organize-video-projects).

## The next-day review is not optional

Come back the following morning and watch the batch on a phone, in order, before publishing anything. Roughly the mistakes that survive an editing session are:

- An opening line that only makes sense if you already know the topic.
- A caption sitting under the platform interface, which is a framing problem you cannot see while editing on a desktop monitor.
- A clip that is fine but redundant with another clip in the same batch.
- Audio that is loud enough on headphones and too quiet on a phone speaker.

The next-day pass typically catches one real problem per batch. That is worth ten minutes.

## Killing a clip is part of batching

Batches produce some clips that should not ship. A clip that needs a paragraph of setup to make sense, or that duplicates a point already made better in the batch, is not worth rescue editing.

The economics are the argument: if four strong clips go out and one weak clip is deleted, the week is fine. If five clips go out and one is weak, the weak one spends attention that the strong ones needed. Deleting is cheaper than fixing, and much cheaper than the habit of publishing everything you make.

## Where batching stops working

This system suits talking-head commentary, explainers, screen recordings, tutorials and anything built from a script. It is a poor fit for footage where the clip is found rather than made: sports, event coverage, reaction content, anything where you are selecting from hours of someone else doing something.

For that material, the search is the work and it cannot be predicted in advance. Batch the parts around it — captions, export, thumbnails — but accept that the selection pass will be per clip.

## A realistic weekly shape

Two sessions and a review. Session one captures raw material for the batch. Session two cuts it in passes. The review happens the next morning and takes ten minutes. Publishing is scheduled in one go rather than daily, which is the subject of [publishing and scheduling shorts](/blog/publish-and-schedule-shorts).

None of that requires a bigger team or a better camera. It requires deciding that the week has two editing sessions instead of five, and then protecting that decision when an idea arrives on a Wednesday and feels urgent. The idea goes into the next batch. That is what makes the next batch easy to record.
`,
  },
  {
    slug: 'export-settings-vertical-video',
    title: 'Export Settings for Vertical Video That Survive Upload',
    description:
      'Resolution, frame rate, bitrate, codec and audio settings for vertical video, plus the export mistakes that cause soft or silent uploads.',
    date: '2026-11-06',
    category: 'Tutorial',
    content: `
# Export Settings for Vertical Video That Survive Upload

Every platform re-encodes what you upload. That single fact explains most of the "why does my video look worse after posting" complaints. You are not choosing a final file; you are choosing how much quality is left for their encoder to work with.

Get the basics right and a phone-shot clip looks crisp after upload. Get them wrong and even good footage goes soft, stutters, or arrives silent.

## Resolution: 1080 by 1920 is the floor, not the target

Vertical video is 9:16. The safe export is 1080 by 1920. It is what every platform accepts, it plays everywhere, and it is small enough to upload quickly.

Exporting larger has one real benefit: if the platform decides to re-encode at a higher resolution, it has detail to work with. Exporting at 1440 by 2560 or 2160 by 3840 from a source that genuinely has that detail can look slightly cleaner after upload. It also multiplies file size and upload time, and it does nothing at all if the original footage was 1080 by 1920 to begin with.

The rule that matters: never upscale. Exporting a 720p source at 4K produces a large file full of interpolated mush, and the platform's encoder will spend bitrate preserving the mush.

If your footage is horizontal and you are cropping to vertical, check the crop before you check the settings. A crop that cuts off the top of someone's head is not fixable in the export dialog.

## Frame rate: match the source, do not convert

Export at the frame rate you shot. 30 frames per second for most talking-head and tutorial content, 60 for gameplay, sports and anything with fast motion.

Converting frame rates is where stutter comes from. 24 to 30 requires inventing frames or repeating them, and 30 to 24 means dropping them. Both produce judder that is subtle on a desktop monitor and obvious on a phone.

The other trap is variable frame rate. Many phone cameras and nearly all screen recorders write files whose frame timing varies instead of staying constant. Editors dislike this, and the mismatch can produce audio drift that grows over the length of the clip. If you record screen content, check whether the recorder can output constant frame rate, and set the export to the same rate.

## Bitrate: the setting that actually decides sharpness

Bitrate is how many bits per second are spent describing the picture. Too low and motion turns into blocks; too high and you have a big file with no visible gain, because the platform will compress it anyway.

As a starting point for 1080 by 1920:

- **30 fps:** roughly 10 to 16 Mbps is a sensible window for most content.
- **60 fps:** roughly 16 to 24 Mbps, because there are twice as many frames to describe.
- **Talking head with a static background:** the low end is fine. Compression loves stillness.
- **Fast motion, confetti, water, camera movement:** go to the high end. These are the patterns that break first.

If a platform offers a quality slider instead of a number, choose the high setting for anything with movement and the middle setting for static content. Do not choose the maximum out of superstition; it costs upload time and returns little.

## Codec: H.264 unless you have a reason

H.264 is understood by every platform, every browser and every phone. It is the safe default and the one to use when you do not want to think about this section.

H.265, also called HEVC, produces a smaller file at the same quality, which matters if your upload connection is slow. The cost is compatibility: some platforms re-encode it poorly, some browsers will not preview it, and older devices may refuse it. If you use HEVC, keep the H.264 version as the one you actually upload and treat the smaller file as a backup.

ProRes, DNxHD and similar editing codecs are for intermediate work, not for publishing. They are enormous and platforms will compress them heavily. Export them only as a master copy you keep for later re-edits.

## Audio: the settings nobody checks until it is silent

Audio problems are the most common reason a finished export gets pulled minutes after posting. Set these deliberately:

- **Sample rate:** 48 kHz. Music and platform pipelines assume it, and resampling a 44.1 kHz export adds a step you do not need.
- **Channels:** stereo, even for a single voice. Mono tracks sometimes play on one side only depending on how the platform handles them.
- **Bitrate:** 320 kbps AAC, or 256 if the option is not offered. Audio bitrate is cheap; do not economise here.
- **Loudness:** many platforms normalise toward roughly minus 14 LUFS. Mixing far below that gets turned up, which raises the noise floor; mixing far above gets turned down, which flattens impact. Aim near it and check the meter rather than trusting your ears on one device.

Then listen to the exported file on a phone speaker at low volume. If the voice is still intelligible, the mix works.

## The five export mistakes that show up most

1. **Double compression.** Exporting from an already-published download, then uploading again. Each pass costs quality. Always export from the original source.
2. **Wrong aspect ratio.** A 16:9 export with black bars top and bottom is technically vertical and looks like a mistake. Crop or reframe instead.
3. **Cropping after styling.** Captions and graphics placed for a full frame get cut when the frame is cropped at export. Style for the final canvas.
4. **Exporting before checking the last frame.** Exporters occasionally drop the final frame or freeze it. Watch the end, not just the beginning.
5. **Trusting the preview.** Editor previews are frequently scaled down, so softness and caption placement errors are invisible there. Judge the exported file.

## A checklist to run once per batch

- Canvas 1080 by 1920, no letterboxing.
- Frame rate matches the source and is constant.
- Bitrate at the high end for motion, the low end for static.
- H.264 unless there is a specific reason otherwise.
- 48 kHz stereo audio, around minus 14 LUFS.
- File plays start to finish outside the editor.
- Audio audible on a phone speaker at a third of the volume.
- Captions clear of the platform interface.

Save that as a preset and the export pass in a batch becomes near-mechanical, which is exactly what you want it to be. The batching method itself is in [how to batch produce a week of shorts](/blog/batch-produce-shorts).
`,
  },
  {
    slug: 'organize-video-projects',
    title: 'How to Organize Video Projects You Can Find Again',
    description:
      'A folder-and-filename system for video work that still makes sense six months later, including versioning, backups and safe deletion.',
    date: '2026-11-06',
    category: 'Workflow',
    content: `
# How to Organize Video Projects You Can Find Again

The failure is rarely dramatic. It is three months later, a clip performed well, and you want to make a follow-up from the same footage — and you cannot find the take. The export is somewhere, the original is nowhere, and the project file has a name like final2new.

Video work generates a lot of files that look similar: many takes, several exports, screenshots, audio recordings, versions. Without a system the folder becomes a pile, and a pile is only searchable by memory.

This is a small system that survives time, and it costs about ten seconds per project.

## Decide the naming rule once

The rule should be boring and sortable. Date first, then subject, then version:

**2026-11-06-sourdough-timelapse-v02**

Why each part earns its place:

- **Date first in year-month-day order** sorts correctly in every file browser without any special tool. Day-first or month-first formats do not.
- **Lowercase with hyphens** avoids the space-versus-underscore argument and travels safely between Windows, macOS, Linux servers and web uploads.
- **A subject a stranger could understand.** Not "clip", not "test", not "edit".
- **A version number with two digits**, so v10 does not sort before v2.

Apply it to projects, exports and batch folders. Apply it to nothing else; the value comes from it being universal.

## One folder per project, three subfolders

Every project gets a folder named with that convention, containing exactly three subfolders:

- **raw** — camera originals, screen recordings, imported audio. Never edited, never deleted until the project is archived.
- **work** — the project file, plus anything generated during editing: proxies, transcripts, graphics, music.
- **export** — finished files, and only finished files.

The discipline that makes this work is that **raw is read-only**. The moment you trim, rename or move a file inside raw, you have lost the ability to tell the original from the derivative.

If your editor imports by reference rather than copying, this structure matters more, because moving raw breaks the project. Keep the folder in one place and do not reorganise it mid-project.

## Version up, never sideways

Replacements are where projects get lost. The habit to build: never edit over a version you might want back, and never use the word final.

Use v01, v02, v03 — and when a reviewer asks for changes, v04 is a copy, not an overwrite. Two rules make this cheap:

- Only version when something external has seen the previous one. Internal saves do not need versions.
- Write one line in a notes file saying what changed in each version. Six weeks later, v07 is meaningless without it.

"final" is the word that ends up on four different files. If you must use a word, use the version number and let the highest one be the current one.

## The project file is the artifact

An export is a dead end. The project file is what lets you re-cut, re-caption or re-time the same material for a different platform. Treat it as the thing you are protecting.

Two consequences:

- **Save the project somewhere you will still have it.** If you edit in the browser, download and keep the project file alongside the export, in the same project folder.
- **Keep the material the project depends on.** A project file that references a clip you deleted is a file that no longer opens properly.

## Backups: the honest minimum

A single copy on a single drive is not a backup, and video files are large enough that people skip this step entirely until they lose something.

The minimum worth doing: keep the working project on your main drive, keep a copy of the **export** folder on a second drive or cloud location, and keep the **raw** folder until the project is at least a month old. Exports are small and valuable; raw is large and only sometimes needed again.

If you want the formal version of this, the widely used phrasing is three copies, two kinds of media, one off-site. For a solo creator the practical version is a working drive, an external drive, and one cloud copy of the exports.

## Deleting without regret

Space runs out, and the order in which to give it up is fairly consistent:

1. **Intermediate renders and proxies.** Regenerable, and often the largest files in the folder.
2. **Duplicated exports.** Keep the highest quality one; the version sent to a client three revisions ago is rarely needed.
3. **Raw footage for projects that shipped and are older than a month.** Delete only after the export is backed up and the project file is saved.

What not to delete: the project files, the exported masters, and anything you do not have a second copy of.

## Handing files to someone else

When a collaborator or client needs the material, send a folder that follows the same convention, and include the notes file. The naming rule is the whole handoff: they can tell which file is newest without opening any of them.

If you are sending an export for review, say which version it is in the filename and in the message. Two people reviewing different versions is the most common way a good edit gets undone.

## Search is only as good as the names

Every operating system can search filenames instantly. That only helps if the names contain words you would search for. "clip7" is unfindable; "2026-11-06-sourdough-timelapse-v02" is findable by date, by subject or by version.

The same logic applies inside an editor's project list. A batch of clips named by number is a batch you have to open one at a time. A batch named by subject is a batch you can work through in order.

## Start with the next project, not the archive

Reorganising years of old files is a project that never gets finished and produces no videos. Apply the system to the next thing you make. After five projects the habit is set, and the old pile becomes progressively less relevant because everything current is findable.

When the batch workflow in [how to batch produce a week of shorts](/blog/batch-produce-shorts) starts producing several projects per week, this structure is what keeps them from turning into a pile.
`,
  },
  {
    slug: 'music-and-clip-licensing',
    title: 'Music and Clip Licensing for Short-Form Video',
    description:
      'What you can and cannot legally use in a short: platform music libraries, royalty-free tracks, other people’s footage, and how to ask for permission.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# Music and Clip Licensing for Short-Form Video

Two questions get confused constantly, and the confusion is expensive. The first is "can I use this song?" The second is "can I use this recording of this song?" They have different answers, because a piece of recorded music carries at least two separate rights.

This guide is a practical map, not legal advice. Rights law varies by country and by platform, and the specific terms of any library you use govern your situation. What follows is how to reason about it so you do not have to guess.

## The two rights in every song

A released track contains:

- **The composition** — the melody, lyrics and arrangement as written. Owned by the songwriter or publisher.
- **The recording** — the specific performance captured on tape. Owned by the label or the artist.

Using a song in a video normally requires permission for both. That is why "I bought the track on iTunes" does not help: buying a copy gives you the right to listen to that recording, not to synchronise it with your video.

The permission to put music under picture is called a sync licence. It is negotiated, not listed on a price sheet, and for well-known music it is usually out of reach for an individual creator.

## The platform libraries are the easy path, with a catch

The music available inside TikTok, Instagram, YouTube and similar apps is licensed for use **on that platform**. That is the catch, and it has three consequences worth knowing before you build a workflow around it:

1. **In-app is in-app.** A track saved from one app's library and uploaded to another platform is not covered by that licence.
2. **The catalogue changes.** Tracks are removed when agreements lapse. A video that used a removed track can be muted or flagged later, sometimes years after posting.
3. **Business accounts differ.** Commercial libraries are often narrower than the personal ones, and some tracks are unavailable to accounts that post promotional content.

The practical rule: use the platform's own library for content that lives only on that platform, and check the current terms inside the app rather than trusting a blog post — including this one.

## Royalty-free does not mean rights-free

"Royalty-free" means you pay once and do not owe per-play royalties. It does not mean no conditions. Typical licences from stock music libraries restrict or require:

- Attribution in the description.
- A paid tier for commercial or monetised use.
- A separate licence for broadcast or paid advertising.
- No redistribution of the track as a standalone audio file.

Read the licence for the specific track, save a copy of it, and note the date. If a claim ever arrives, the licence file is your defence, and a library's terms can change after you downloaded.

## Using other people's video

This is where most takedowns originate, more often than music. The instinct is to assume that brief use, credit, or "no copyright infringement intended" makes it fine. None of those do anything legally.

The only reliable permissions are:

- **A licence that covers your use.** Creative Commons, for example, but check which variant: some forbid commercial use, some require share-alike, some require attribution in a specific form.
- **Written permission from the rights holder.** An email saying yes, with the scope stated, is enough for most purposes. A DM that says "sure" is weaker but better than nothing.
- **Your own footage.** The safest material you will ever have.

Fair use — or fair dealing in some countries — is a defence you can raise after being accused, decided on factors like purpose, amount used and effect on the market. It is not a permission you can obtain in advance, and it is not a shortcut. Commentary, criticism, parody and education are the categories most likely to qualify; using a clip because it is entertaining is the category least likely to.

## How to ask for permission

A short, specific message gets a yes far more often than a vague one. It needs five things:

1. Who you are and where the video will appear.
2. Exactly which material you want, with a link and a time range.
3. What you will do with it — commentary, excerpt, background.
4. Whether the video is monetised or promotional.
5. How long it stays up, and whether it can be removed on request.

Keep the reply. If the rights holder later changes their mind, the record of the exchange is what protects you.

## Things you own that still cause trouble

Footage you shot yourself can still contain someone else's rights:

- **A performance.** Filming a concert you attended does not give you the rights to the performance.
- **A logo or artwork in frame.** Usually tolerable as incidental background, not as the subject of the shot.
- **A private individual who did not consent.** Especially in a commercial context.
- **Someone else's screen.** Recording a video call, a game or a streaming service captures content you do not own.

## A decision path that takes thirty seconds

- **Did I shoot it?** Then check for performances, logos and bystanders, and proceed.
- **Is it in the app's own library, and will this video stay on that app?** Proceed.
- **Is it from a stock library with a licence that covers my use?** Proceed, and save the licence.
- **Is it someone else's clip, used to comment on it?** Keep the excerpt short, make the commentary the point, and get permission if it is easy to get.
- **Is it a popular song I want as a soundtrack?** Use a licensed alternative. This is the case where creators get flagged most and win least.

## Keep a rights folder

One folder per project, containing the licences, the permission emails and a note of which track or clip is used where. It takes two minutes and answers the only question that matters when a claim arrives: can you show you were allowed?

That folder belongs inside the project structure described in [how to organize video projects](/blog/organize-video-projects) — a licence you cannot find is a licence you do not have.
`,
  },
  {
    slug: 'publish-and-schedule-shorts',
    title: 'How to Publish and Schedule Shorts Without Burning Out',
    description:
      'A sane publishing routine: choosing a cadence you can hold, scheduling a batch in one sitting, cross-posting without watermarks, and reading the results.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# How to Publish and Schedule Shorts Without Burning Out

Publishing is the part of short-form video that looks free and is not. Uploading one clip to three platforms, writing three captions, choosing three sets of tags and remembering to do it again tomorrow is twenty minutes a day that produces no video.

The fix is the same shape as batching the editing: do the publishing for a whole batch in one sitting, then let it run.

## Pick a cadence you can hold for three months

Advice about posting daily is usually written by people whose job is posting. For a solo creator with a business to run, the cadence that works is the highest one that does not consume the time needed to make the next batch good.

A useful test: imagine the week you are about to have, including the bad one — the week with a deadline, a cold, or travel. If the cadence survives that week without you skipping, it is your cadence. If it only works in a good week, it is not a cadence, it is a burst.

Three posts a week sustained beats seven a week for a fortnight and then nothing for a month, both for the audience and for your own skill, because the second version never gets far enough into the feedback loop to learn anything.

## Schedule a whole batch in one sitting

Uploading is mostly waiting, so it is the ideal thing to do while doing something else. The pattern:

1. **Have the final files ready and verified.** Exported per [the export settings guide](/blog/export-settings-vertical-video) and reviewed the next day.
2. **Write all the captions first**, in one document, before opening any upload form. Writing five captions in a row takes a fraction of the time of writing one, uploading, writing another.
3. **Upload to one platform at a time**, not one video at a time across platforms. Platform by platform keeps the interface and the field layout constant.
4. **Schedule, do not publish, when the platform allows it** — with one exception, covered below.
5. **Record what you scheduled**, with dates, so the review later has something to check against.

## The first-upload exception

Some creators find that a freshly published video gets more initial distribution than a scheduled one. Whether that is true varies by platform and changes over time; the honest position is that nobody outside the platform knows, and the effect, if it exists, is smaller than the difference between a good clip and a mediocre one.

What is reliably true is that scheduling removes the 11pm upload, the forgotten post and the typo in the caption. Do not trade a dependable routine for a rumour about the algorithm. If you want to test it, test it deliberately: publish five manually and schedule five, and compare after a month rather than after one video.

## Cross-posting without looking lazy

Posting the same file everywhere is fine. Posting the same file with another platform's watermark is the fastest way to look automated, and some platforms suppress or downrank content carrying a competitor's mark.

So:

- **Export clean.** Turn off platform watermarks, or export before adding any.
- **Upload the clean file to each platform separately.** Re-uploading a download from platform A to platform B re-compresses it and can carry the mark.
- **Rewrite the caption per platform**, at least partly. The same sentence on three platforms reads as syndication. A different first line does not.
- **Match the format.** Where a platform offers a dedicated short format, use it rather than a generic video post, because the two are surfaced differently.

## Metadata: three fields, not thirty

The temptation is to spend an hour on hashtags. For a small account the returns are marginal compared to the title and the first line of the caption, which are what a viewer actually reads and what the platform uses most heavily.

- **Title or first caption line:** say what the video is about in plain words. This is what shows in a feed and what search matches.
- **Description:** one or two sentences of context, plus any required attribution for music or footage.
- **Tags:** a handful of genuinely relevant terms. Padding with unrelated popular tags does not help and signals low quality.

On-platform search is a real traffic source for short-form, and it rewards the same thing web search does: clear language about a specific subject. Our [TikTok SEO guide](/blog/tiktok-seo-guide) covers the details.

## What to do with a video that flops

Most videos do not perform, and the useful response is diagnosis rather than deletion. Two numbers separate the cases, and both are in the platform's own analytics:

- **Low reach, decent retention.** The opening was not compelling enough to earn distribution, or the topic has no audience on this platform. Fix the first three seconds, or change the subject.
- **Good reach, poor retention.** The opening worked and the content did not hold. This is the more fixable case and the more painful one, because the effort was already spent.
- **Both low.** Usually a topic problem, not an editing problem. Repeating it with better captions will not help.

Deciding which case you are in takes two minutes. Guessing takes longer and teaches nothing.

## The fifteen-minute weekly review

Once a week, with the batch already scheduled, look at last week's posts and answer three questions:

1. Which clip held attention longest, and what did its opening do differently?
2. Which performed worst, and which of the two failure cases was it?
3. What one thing goes into the next batch because of the answer to question one?

That is the entire review. Expanding it into a spreadsheet of every metric is a common way to stop doing it by week three.

## Make the treadmill unnecessary

A cadence you can hold still needs material, and material runs short if every clip must be new. Three sources that keep a schedule alive:

- **A series.** The same format on a repeating subject, which is easier to produce and easier to follow.
- **Evergreen re-cuts.** A clip that worked six months ago can be re-edited with a better opening rather than remade. The source is already on disk if you followed [the project organisation guide](/blog/organize-video-projects).
- **One long recording, many clips.** A single podcast, webinar or livestream is a batch by itself; the method is in [turning one podcast into ten shorts](/blog/podcast-into-shorts).

## The routine, in one paragraph

Batch the recording and editing into two sessions. Export with one preset. Schedule the whole batch in a single sitting, platform by platform, with clean files and rewritten first lines. Spend fifteen minutes a week reading what happened, and change exactly one thing in the next batch. Then repeat, at a cadence that survives a bad week.
`,
  },

  /* ---------------------------------------------------------------------
   * Round three. Everything up to here assumed the footage already existed
   * and was worth cutting. These five are about getting that footage: light,
   * delivery, self-filming, screen capture and scripting. Capture is where
   * most weak shorts are actually decided, and none of it was covered.
   * ------------------------------------------------------------------- */
  {
    slug: 'light-yourself-vertical-video',
    title: 'How to Light Yourself for Vertical Video',
    description:
      'One light, placed properly, beats a room full of gear. Direction, distance, fill and the mistakes that make faces look flat or blown out.',
    date: '2026-11-06',
    category: 'Tutorial',
    content: `
# How to Light Yourself for Vertical Video

Lighting is the difference between a clip that looks like it was shot by a professional and one that looks like it was shot in a hallway. It is also the cheapest thing on the list to fix: a window and a white wall will do most of the work, and the mistakes that ruin footage are mostly about where the light is rather than how much of it there is.

The goal is simple to state. One side of the face is lit, the other side is not in darkness, the eyes have a small catch of light, and the background is darker than the face so the face separates from it. Get those four things and nothing else matters much.

## Start with the window, not with gear

If you have a window, you have a key light, and it is a large soft one — which is exactly what most cheap lighting kits are trying to imitate. Stand facing it, three-quarters on, so the light falls across one cheek and leaves a gentle shadow on the other side.

Three rules for using a window:

- **Never sit with the window behind you.** This is the single most common failure. The camera exposes for the bright window, the face goes dark, and no amount of editing recovers it.
- **Back away from the glass.** Close to a window, the light is intense and the falloff is steep. A metre or two back gives a softer, more even result.
- **Diffuse it if it is direct sun.** A sheer curtain is a diffuser. Direct sun on a face produces hard shadows that read as harsh on camera.

If the only window is behind you, turn the whole setup around and shoot the other way, even if the background is worse. A well-lit face against a plain wall beats a nicely decorated background with a silhouette in front of it.

## If you need a light, buy one and place it properly

A single LED panel with a diffuser is enough. Do not buy three.

- **Position it 45 degrees to one side of your face**, and slightly above eye level. Higher than that and the eye sockets go dark; level with the face and the lighting reads as flat and clinical.
- **Bring it close and turn it down** rather than putting it far away and turning it up. A large source close to the face is soft; a small source far away is harsh, even at the same brightness on the subject.
- **Do not point it at the ceiling and hope.** Bounced light is beautifully soft but loses most of its strength; useful in a small white room, useless in a dark one.

That placement — one source, 45 degrees, slightly high — is the whole of "professional lighting" for a talking head in a vertical frame.

## Fill is what stops the dark half looking broken

A single light leaves one side of the face in shadow. That is good; a completely flat face looks like a passport photo. What you do not want is a hard black edge where the shadow falls off completely.

The cheapest fill in existence is a white wall, a white sheet of foam board, or a sheet of paper on a stand, placed on the unlit side and angled toward the face. It bounces a little light back into the shadow. It costs nothing and it is the difference between "lit" and "sculpted".

A second light works too, but set it noticeably dimmer than the key. Two equal lights from opposite sides cancel the shape out and produce the flat look people associate with bad studio setups.

## Separate the face from the background

In a vertical frame the background fills most of the picture, so a background the same brightness as the face flattens the whole image. Two options, in order of preference:

1. **Make the background darker than the face.** Turn off the room lights behind you, close the curtains, point nothing at the back wall.
2. **Add a small light on the background**, if the room is unavoidably bright, so the separation comes from colour rather than brightness.

Distance helps as well: standing a couple of metres in front of the wall rather than against it means the wall falls darker and softer, and the shadow you cast lands out of frame instead of behind your head.

## Do not mix colour temperatures

Daylight from a window is blue-ish. Most room bulbs are orange-ish. Put both on a face and one side goes warm while the other goes cold, which the eye forgives and the camera does not.

Either shut the room lights off and use only the window, or close the curtain and use only the artificial light. If you must mix, put a corrective gel on the artificial source so it matches the window — or set the phone's white balance manually to whichever source is dominant and accept a slight cast on the other side.

## Lock exposure before you record

Phone cameras re-meter constantly. Wave a hand, lean forward, and the exposure shifts mid-sentence, which is visible as a pulse in the finished clip and impossible to remove afterwards.

So, with the face lit and framed:

- Tap and hold on the face until the focus/exposure lock engages.
- Drag the exposure slider down slightly until the brightest part of the face is not clipping. Skin that has gone pure white has no detail left to recover.
- If your camera app shows a highlight warning or zebras, use it: anything flashing is information you have lost.

Locking exposure is worth more than any lighting upgrade, because it also fixes the pulsing.

## The four mistakes that account for most bad footage

1. **Window behind the subject.** Covered above, and still the most common.
2. **Overhead light only.** Ceiling lights put the eyes in shadow and the forehead in highlight — the raccoon look.
3. **A ring light straight on the face.** Even, shadowless, and identifiable at a glance as a webcam setup. Move it off-axis.
4. **The brightest thing in frame is not the face.** A lamp, a monitor, a white shirt. The viewer's eye goes to the brightest area, so make that the face.

## Rooms that fight you

- **A dark room with one warm bulb.** Add the brightest window you can find, or a single LED panel at 45 degrees, and turn the bulb off.
- **A room with fluorescent strips.** These flicker at mains frequency and can produce rolling bands on video. Change the shutter speed if your app allows it, or use daylight instead.
- **A room with no window and no lamp.** A phone screen is a light source: prop a second phone with a white screen facing you as a fill. It is not good, but it is better than nothing.

## Quick checklist before every take

- Light comes from one side, slightly above eye level.
- Nothing bright is behind the subject.
- The shadow side is soft, not black.
- Background is darker than the face.
- One colour temperature only.
- Exposure and focus locked on the face.

That is a two-minute setup once you have done it a few times, and it is the part of the picture that viewers judge before they judge the edit. Once the footage looks right, the caption and framing decisions in our guide to [vertical safe zones](/blog/vertical-video-safe-zones) are what keep it readable on a phone.
`,
  },
  {
    slug: 'sound-natural-on-camera',
    title: 'How to Sound Natural on Camera',
    description:
      'Why reading a script sounds like reading, how to use a teleprompter without sounding like one, and how to pick takes by energy instead of accuracy.',
    date: '2026-11-06',
    category: 'Tutorial',
    content: `
# How to Sound Natural on Camera

Almost everyone sounds worse on camera the first time than they do in conversation, and the gap is not talent. It is that speaking to a lens removes the two things that make conversation easy: a listener reacting, and the freedom to say it badly first and fix it later.

What replaces them is a set of habits, and they are learnable in an afternoon.

## Why scripted delivery sounds scripted

Written English and spoken English are different rhythms. Written sentences carry more clauses, more subordinate clauses, more comma-paced pauses. Read aloud, that structure produces a cadence that nobody uses when talking, and listeners hear it instantly as reading.

The fix is not to abandon the script. It is to write in spoken units:

- **One idea per sentence.** If a sentence contains "which means that", split it.
- **Contractions everywhere.** "Do not" becomes "don't". Read a script with no contractions aloud and it sounds like a news bulletin.
- **Short first sentence, then the next one.** Vary length, but keep most sentences short enough to say in one breath.
- **No written punctuation tricks.** Em dashes and semicolons are invisible in speech and turn into awkward pauses.

A useful test: read the line aloud. If you stumble, the line is wrong, not your delivery. Rewrite it until it falls out of your mouth.

## The teleprompter, used correctly

A teleprompter is the tool most likely to make you sound like you are reading, because it encourages you to read. Used badly it produces the flat, eyes-scanning cadence everyone recognises.

Used properly it is a memory aid, not a script:

- **Put bullet phrases on it, not sentences.** Three or four words per bullet. Your brain fills in the grammar, which is what makes it sound spoken.
- **Place it as close to the lens as possible.** Eyes tracking text across a wide screen are visibly reading; eyes near the lens are not.
- **Scroll slower than feels right.** If you are waiting for text, you are reading. If the text is waiting for you, you can look away and come back.
- **Break the rhythm deliberately.** Pause, look off-camera for a beat, come back. Reading never does that; talking does.

If you cannot place the prompter near the lens, bullet points on a sticky note beside the camera work nearly as well and cost nothing.

## Say it twice, then keep the second

When you have the choice, record the same idea twice. The first take is where you work out what you are saying. The second is where you say it.

This is why the second take so often sounds better even when the first is technically more accurate: accuracy is not what the viewer is judging. Energy is.

So pick takes by these, in order:

1. **Energy and pace.** A slightly wrong word delivered with conviction beats a perfect sentence delivered flatly.
2. **Clarity.** No mumbling, no trailing off at the end of sentences.
3. **Accuracy.** Last. You can fix a small factual slip with a caption or a cutaway; you cannot fix a monotone.

## The wind-up you have to cut

Most people begin a take with a verbal run-up: "okay so basically what I wanted to say about this is". It is a nervous habit, and every second of it is a second where a viewer can leave.

Write the first sentence so it can be the first thing heard. If the take you recorded starts with a run-up, cut it — the cut is invisible if it lands on a word boundary and the next word is said with energy.

## Hands, eyes and the rest of the body

Delivery is not only voice. On a phone screen the face fills the frame, so small habits read large:

- **Look at the lens, not at yourself.** Watching your own preview is what makes eyes drift.
- **Use your hands, but keep them in frame.** Gestures that leave the frame look like twitches. Gestures visible in the lower third look natural.
- **Move on transitions.** A slight lean forward when you change point gives the edit natural cut points and keeps the frame alive.
- **Do not sway.** Rocking side to side is the most distracting habit in vertical video because the frame is narrow.

## Nerves, practically

Not the deep-breathing advice — the mechanical things that actually help:

- **Record a throwaway first.** Ten seconds about nothing. The first take is always the worst, and using it as a warm-up means it does not have to be good.
- **Say the first line five times before recording.** The opening line carries the most pressure; rehearsing only that line removes most of it.
- **Stand up.** Standing gives you more breath support and makes gestures natural. Sitting produces a smaller, flatter voice.
- **Accept the mess.** You are recording many takes in one session; the pressure is off any single one.

## Warm up the voice, not the nerves

Ten minutes of humming and reading aloud before the first take is the difference between the first three takes being throwaways and the first three being usable. The voice needs a few minutes of use before it settles into its normal range, and a session recorded cold sounds thin at the start.

What helps, in order of effect:

- **Hum for a minute**, sliding up and down through your range. It warms the resonances that make a voice sound full.
- **Read a paragraph aloud** in your normal speaking voice — not a script, a news article is fine. This is the part that switches your mouth from reading mode to talking mode.
- **Say the opening line three times** at a normal volume, then once louder than feels natural. The take you record will sit somewhere in the middle of that range.

What does not help: silent deep breathing, which calms you without waking the voice, and rehearsing the whole script repeatedly, which makes the delivery stale before the camera is on.

## Practise by recording audio only

Once a day, for sixty seconds, record yourself talking about something you know, with no camera and no script. Listen back. You are listening for three things: filler words, sentences that ran out of breath, and whether the ending trailed off.

This is the fastest improvement available because it removes the camera from the equation. You are not practising being on camera; you are practising speaking in complete thoughts, which is the skill that was missing.

## What to fix in the edit, and what to re-record

Editable:

- Run-ups, false starts, repeated words.
- Long pauses and breaths between sentences.
- One flubbed word, if a cut or a caption covers it.

Not editable:

- A flat, tired delivery across the whole take.
- Mumbling, or a voice that drops away at the end of every sentence.
- Reading that is visible in the eyes.

Those three are worth another take. Everything else is a cut.

Once the delivery is right, the audio chain in [fixing bad audio](/blog/fix-bad-audio-shorts) is what carries it, and the batching method in [producing a week of shorts](/blog/batch-produce-shorts) is what stops you recording five separate warm-ups.
`,
  },
  {
    slug: 'film-yourself-without-a-crew',
    title: 'How to Film Yourself Without a Crew',
    description:
      'Phone placement, focus and exposure lock, audio checks and framing for a one-person shoot that does not look like a webcam call.',
    date: '2026-11-06',
    category: 'Tutorial',
    content: `
# How to Film Yourself Without a Crew

A one-person shoot has one advantage over a crew: nothing has to be coordinated. It has one disadvantage: nobody is watching the frame while you are in it, so every error is discovered after the take rather than during it.

The method below is designed around that. Most of it is about removing the things that can go wrong silently — focus hunting, expired storage, unmonitored audio — before you start talking.

## Height is the first decision

Put the lens at eye level. Not below the chin, which makes nostrils the subject, and not above the forehead, which makes the body look short and the room look like a security camera.

In practice, for a phone that means a tripod, a clamp on a shelf, or a stack of books that will not shift. A phone propped against a mug is the most common cause of a take that slowly slides out of frame.

Eye level also decides how much of the room is in shot. Slightly above eye level and angled down gives a clean background with no ceiling; exactly at eye level keeps the horizon flat and reads as neutral.

## Distance and framing

For talking head footage, arm's length to about a metre is the useful range.

- **Too close:** the face distorts, the nose grows, and there is no room for captions.
- **Too far:** the room becomes the subject and the audio from a phone mic gets thin.

Framing rules that suit a vertical frame:

- **Eyes in the upper third.** Not the middle; the upper third leaves room to breathe below.
- **Small headroom.** A hand's width above the hair, no more. Large headroom is the classic sign of a frame composed for horizontal.
- **Chin clear of the caption zone.** Leave the bottom quarter for captions and the platform interface. That zone is exactly what [vertical safe zones](/blog/vertical-video-safe-zones) is about.
- **Shoulders inside the frame.** Cropped shoulders look like a mistake; a full upper body reads as intentional.

## Lock focus and exposure, every take

Phones re-focus and re-meter constantly. The result is a clip where the face drifts soft and the brightness pulses, both of which are unfixable later.

- Tap and hold on your face until the lock indicator appears.
- Check the exposure is not clipping the brightest part of the face.
- If you move between takes, re-lock. Moving changes the distance and the lock may release.

On a camera with manual controls, do it manually and write down the settings so a later re-shoot matches.

## Silence the phone

A notification sound mid-take is a wasted take. Before recording:

- Airplane mode, or at minimum do not disturb with calls allowed from nobody.
- Disable the ringer switch vibration if the phone is mounted on the same surface as the microphone.
- Close other apps that might interrupt the camera.
- Turn off automatic screen brightness if the screen is visible in a mirror or reflection.

## Storage, battery and heat

The three failures that end a session:

- **Storage.** Vertical 1080p footage is roughly a few hundred megabytes per minute, depending on the phone. An hour of takes can fill a phone. Clear space before you start, not during.
- **Battery.** Recording drains fast and heat accelerates the drain. Start above half and keep it plugged in if the cable is out of frame.
- **Heat.** Long recording sessions in a warm room cause phones to dim the screen or stop recording. Take breaks; do not record in direct sun.

## Monitor the audio, always

This is the step everyone skips and the one that ruins whole sessions: a dead microphone, a cable in the wrong socket, or a phone case blocking the mic.

So record ten seconds, stop, and listen on headphones before the first real take. If you have a lavalier or a USB mic, that test is the difference between a usable session and an unusable one.

If you are using the phone's own microphone, note that it is directional and small. It picks up the room, the fan and the road outside. Our guide to [fixing bad audio](/blog/fix-bad-audio-shorts) covers what can be rescued and what cannot, but the ten-second test is what stops you needing it.

## Slate each take

With no crew, you are also the person who has to find the good take later. Say the clip number and the take before you start recording. It takes a second and it removes the entire matching step in the edit.

## One angle is enough

A second camera angle makes a talking head more interesting but doubles the setup and the storage, and in a vertical frame it often just looks like a jump cut. If you want visual variety, get it from a second framing of the same subject — a closer shot for a key sentence — recorded as a separate take rather than a second camera.

What genuinely helps variety more than a second angle is b-roll: a few seconds of the thing you are talking about, shot on the same phone in the same light. Cheap, and it covers cuts.

## When the subject is an object, not your face

A fair amount of one-person footage is a demonstration: hands on a keyboard, a product on a table, a page being turned. The same rules apply with two adjustments.

- **Frame the object, not the room.** Fill the frame with the thing being demonstrated. A product shot from a metre away is a photo of a table.
- **Get the light above and slightly in front of the object**, so the shadow falls behind it rather than across it. A phone torch held off to one side works if it is diffused with a sheet of paper.

Record these as separate takes, not as one long take that includes your face and the object. Separate takes give you b-roll you can cut to when you need to cover an edit, which is the cheapest way to make a talking-head clip feel produced.

## The pre-record checklist

- Lens at eye level, phone secured so it cannot move.
- Eyes in the upper third, small headroom, bottom quarter clear.
- Focus and exposure locked on the face.
- Airplane mode on, notifications off.
- Storage cleared, battery above half.
- Ten-second audio test listened to on headphones.
- Light coming from one side, slightly above.

Run it once and it becomes a habit that takes ninety seconds. Combined with the lighting setup in [how to light yourself](/blog/light-yourself-vertical-video), it is the difference between footage that needs rescuing and footage that needs editing.
`,
  },
  {
    slug: 'record-clean-screen-footage',
    title: 'How to Record Clean Screen Footage',
    description:
      'Settings, cursor habits and cleanup that stop screen recordings looking soft, jittery or unreadable once they are scaled into a vertical frame.',
    date: '2026-11-06',
    category: 'Tutorial',
    content: `
# How to Record Clean Screen Footage

Screen recordings fail in a specific way. They look fine on the monitor where you made them and then arrive in a vertical video as unreadable grey mush, because a 1920-wide window squeezed into a 1080-wide phone screen has thrown away most of the detail that made the text legible.

Almost every problem is decided before you press record: how much is on screen, how large the text is, and whether the capture is scaled or cropped.

## Record at the size you will publish

If the finished video is 1080 by 1920, then a screen recording of a full desktop is the wrong input — it is horizontal, and cropping it to vertical keeps a narrow slice.

The better approach for tutorial and demo content is one of these:

- **Record a window, not the desktop.** One app, sized to a portrait-friendly shape, with the content you actually need. It fills the vertical frame instead of floating in it.
- **Record at 2x and crop in.** Capture a large region at high resolution, then crop the part you use. You keep detail because the source has more pixels than the destination.
- **Design for the crop.** Put the thing you are demonstrating in the middle of the screen and the empty space at the edges, so a vertical crop does not cut the content.

Whichever you choose, decide before you record. Re-framing a screen capture afterwards means re-recording it.

## Make the text genuinely large

Text in a phone video must be readable at arm's length on a small screen while someone is scrolling. That is a far higher bar than readable on a laptop.

- Increase the app's zoom or font size before recording. Browsers and most code editors can zoom to 125 or 150 percent.
- Reduce what is on screen: close the sidebar, hide the file tree, collapse panels.
- If you are demonstrating a menu, open it and leave it open long enough to read — roughly two seconds longer than feels natural.
- One idea per screen. Scrolling to show three things means none of them is readable.

## Frame rate and cursor behaviour

30 frames per second is fine for most screen content and produces smaller files. 60 is worth it when the motion matters: dragging, scrolling, animation, cursor-driven interaction.

What matters more than the frame rate is whether it is constant. Screen recorders frequently write variable frame rate files, which some editors handle badly and which can cause audio to drift away from the video over a long recording. Set constant frame rate if the tool offers it, and export at the same rate.

Cursor habits, in order of how much they help:

1. **Move slowly and deliberately.** Real cursor speed looks like panic on a compressed video.
2. **Enlarge the cursor** in the capture tool if the option exists.
3. **Do not wiggle to find it.** If you lose the cursor, stop and find it, then move.
4. **Hide the cursor entirely** when you are not clicking. Many recorders offer this.
5. **Click once, deliberately.** Double-clicking by accident opens something you did not want on screen.

## Clean the desktop before you start

Everything visible is content. A messy desktop, a personal photo in a dock, an email notification with a name in it — all of it ends up in the video.

- Turn on do not disturb so notifications do not appear mid-take.
- Hide the dock or taskbar if it is not needed.
- Close every window that is not part of the demonstration.
- Empty the desktop, or switch to a plain wallpaper.
- Check bookmarks and tab titles, which often contain client names.

This is also a privacy step, not just a polish one. A notification banner with a message preview is the most common accidental disclosure in screen-recorded tutorials.

## Audio for screen footage

Laptop microphones pick up the fan, the keyboard and the room. Two rules:

- **Use a separate microphone** if you have one, even a cheap USB one, and put it close to your mouth rather than to the laptop.
- **Narrate after recording, not during**, when the demonstration needs clicking. Clicking while talking produces a soundtrack of clicks under every sentence, and recording the voice separately lets you describe smoothly while the video shows the action.

If you must narrate live, keep the microphone off the same surface as the laptop and speak slightly away from it.

## Choose the tool by what it must do

The built-in recorders on Windows and macOS are adequate for a single window and no editing of the capture. They are poor at selecting a region precisely, at constant frame rate, and at recording system audio.

Dedicated capture tools give you region selection, frame rate control, cursor options and separate audio tracks. If you are producing screen content regularly, that control is the reason to use one. If you record a screen twice a year, the built-in tool is fine.

Either way, do a ten-second test recording and play it back before the real take. It is the fastest way to catch a muted microphone or a capture that recorded the wrong monitor.

## The mistakes that show up most

1. **Recording the full desktop for a vertical video.** The content ends up as a small strip in the middle.
2. **Text at normal size.** Unreadable on a phone, and no amount of sharpening fixes legibility.
3. **Recording 4K and shrinking to 1080 without checking.** Usually fine, occasionally soft if the scaling is done twice.
4. **Notification banners.** They appear at the exact moment you are demonstrating something.
5. **Cursor jitter.** The mouse movement reads as nervous system rather than demonstration.
6. **Recording system audio when you only needed the voice**, so music from another tab plays underneath.

## Recording a phone app

Demonstrating a mobile app adds one problem: the phone screen is already the right shape, so recording it horizontally wastes most of the frame. Use the device's own screen recording, which captures at the device resolution, and present it inside the vertical video at full height with the rest of the frame filled by a background or your face in a corner.

Two details worth handling before you record: turn off the device's notification banners, and slow the taps down. A real interaction speed looks like a blur on video, and a tutorial that moves at real speed is a tutorial nobody can follow.

## A short checklist

- Window sized and zoomed for the final vertical frame.
- Text large enough to read on a phone.
- Notifications off, desktop clean, nothing personal visible.
- Constant frame rate, 30 for static content, 60 for motion.
- Cursor enlarged, or hidden when idle.
- Separate microphone, or narration recorded afterwards.
- Ten-second test played back before the real take.

Once the capture is clean, the settings in [export settings for vertical video](/blog/export-settings-vertical-video) are what stop the platform's re-encode from undoing it.
`,
  },
  {
    slug: 'script-shorts-that-sound-spoken',
    title: 'How to Script a Short That Does Not Sound Scripted',
    description:
      'A word budget, three structures that fit 30 seconds, and the editing pass that removes everything written for the page instead of the ear.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# How to Script a Short That Does Not Sound Scripted

A script is not a transcript and it is not an essay. It is a set of instructions to your future self about what to say, in what order, in how many words.

The most common scripting failure is writing prose and then reading it. The second most common is not writing anything and hoping the take works out. Both produce the same result: a clip with no shape.

## Start with a word budget

Length is decided before anything is written, because a short has a hard ceiling and spoken words take time. At a conversational pace, thirty seconds is roughly seventy to eighty words. Forty-five seconds is around a hundred and ten.

Measure your own rate once: record thirty seconds of yourself talking about something familiar, count the words, and use that number. It will be close to the figures above and it will be yours.

Then write to the budget. A script that runs to twice the budget is not a script, it is a draft you will have to cut while recording, which is the worst possible time to make structural decisions.

## Three shapes that fit thirty seconds

**The claim, the proof, the turn.** State something specific, give the one piece of evidence or example that supports it, then close by widening it or reversing it. This is the most reliable shape for commentary and opinion, because it front-loads the thing worth hearing.

**The question, the answer, the consequence.** Open with the question the viewer is actually asking, answer it plainly within a few seconds, then say what follows from the answer. Good for explainers, because the opening question does the work of a hook.

**The list, cut to three.** Three items, each one sentence, each ending with a small turn of phrase. Lists survive short formats because the viewer always knows how much is left. Two feels thin; five does not fit.

What all three have in common: the important thing comes first. A short that builds to its point has already lost the viewer who needed the point.

## Write the opening line five times

The opening line is the only sentence worth rewriting obsessively, because everything else depends on someone staying for it.

Write five versions of the same opening. Then pick the one that is most specific. Specific beats clever: "this clip is four seconds too long" is better than "here is a common mistake". The vague version could introduce anything, which means it introduces nothing.

Then delete any warm-up before it. "So", "okay", "I've been thinking about" — all of it is a runway the viewer did not ask for.

## Write for the ear, not the eye

A pass of edits that reliably improves any script:

- **Split every sentence with a comma-splice.** Two short sentences, not one long one.
- **Contractions everywhere.** Read aloud with and without; the difference is the sound of a person versus the sound of a document.
- **One idea per sentence.** If a sentence needs the word "and" twice, it is two sentences.
- **Cut adjectives.** They cost time and add nothing spoken.
- **Replace abstractions with instances.** "Tools" becomes the specific tool; "people" becomes who.
- **Read it out loud.** Every stumble marks a line to rewrite, not a line to practise.

## The patch you will be tempted to keep

Every script has a paragraph that exists because it was interesting to write, not because the clip needs it. It sits in the middle, it is well phrased, and it makes the video drag.

Cut it. Then read the script again: if nothing is missing, it was the patch.

A useful diagnostic is to read only the first sentence of each paragraph. If those sentences make sense on their own, the paragraphs are buildable; if some of them are invisible in that read, they are the ones the viewer would also skip.

## Rehearse by recording audio only

Once the script is written, record it as audio, once, with no camera. Listen back. This catches three things cheaply:

- Sentences that run out of breath.
- Sections that read better than they speak.
- The actual runtime, which is almost always longer than the estimate.

Fix the script on the basis of that recording, then shoot. Ten minutes of audio-only rehearsal removes the awkward half of a shooting session.

## Where to allow improvisation

A completely fixed script sounds recited; a completely improvised one rambles. The middle ground is to fix the structure and leave the connective tissue loose:

- **Fix:** the opening line, the order of points, the closing line.
- **Leave loose:** the transition sentences between points, the examples you reach for in the moment, the exact phrasing of a joke.

This also makes retakes easier. If the opening is fixed, a flubbed take can be re-entered at the top of a section rather than the whole script.

## When not to script at all

Reaction content, live commentary and anything built on a genuine surprise are better unscripted, because the value is the response and a scripted response is not a response. For those, prepare three things and nothing else: the setup, the order you will cover things in, and a closing line. Everything between is reaction.

For a demonstration, script only the narration and let the action be discovered — which is also why screen recordings work better with the voice recorded separately, as described in [recording clean screen footage](/blog/record-clean-screen-footage).

Knowing which of the three cases you are in — scripted, structured-but-loose, or unscripted — is the decision that comes before writing anything.

## What to cut at the end

After the first read-through, cut ten percent. Not because the script is bad, but because everything written feels necessary to the person who wrote it and the viewer has none of that attachment.

Look for, in order:

1. Definitions of things the audience already knows.
2. Setup that describes what you are about to do.
3. Qualifiers and hedges that soften a claim you already believe.
4. A conclusion that repeats the opening.

## A scripting checklist

- Word budget set from your own measured speaking rate.
- One of the three shapes chosen before writing.
- Opening line written five ways, most specific one kept.
- No warm-up before the first line.
- Read aloud, and every stumble rewritten.
- Audio-only rehearsal recorded and timed.
- Ten percent cut.
- Structure fixed, transitions loose.

A script written this way is mostly invisible in the finished clip, which is the point. The viewer should hear someone talking, not someone reciting — and the delivery habits in [how to sound natural on camera](/blog/sound-natural-on-camera) are what finish the job.
`,
  },

  /* ---------------------------------------------------------------------
   * Round four. The commercial side: pricing, media kits, outreach, contract
   * terms and affiliate links. Nothing in the previous 37 posts covers money,
   * and it is the part creators most often get wrong in ways that cannot be
   * fixed later - a bad usage clause outlives the video it was signed for.
   * ------------------------------------------------------------------- */
  {
    slug: 'price-sponsored-shorts',
    title: 'How to Price a Sponsored Short',
    description:
      'A pricing method built from production time, audience access and usage rights, plus the extras that are usually given away by accident.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# How to Price a Sponsored Short

Most creators price a sponsored video by guessing a number and hoping it is not too high. That produces two failure modes: charging far less than the work is worth, and charging a number the brand cannot justify internally and never hearing back.

A price is defensible when you can explain it. That is what this method does — it breaks the fee into the parts a brand is actually buying, so the conversation becomes a negotiation about scope rather than a stare at a single figure.

## Separate the deliverable from the rights

A sponsored short is not one thing. It is at least three:

1. **The production.** Your time to script, shoot, edit and deliver a video that meets their brief.
2. **The audience access.** Whatever reach your account has, on the platform and in the format they asked for.
3. **The rights.** What they are allowed to do with the video after you post it — and for how long.

New creators usually charge for the first and give away the other two. Those two are frequently worth more than the production.

## Start from your floor, not from a fantasy number

Work out the minimum you would accept, honestly and in writing:

- Hours for the whole job: brief, research, script, shoot, edit, revisions, delivery. Include the parts you always underestimate — the back-and-forth before you shoot, and the revision round after.
- Multiply by the hourly rate you would charge for the same hours doing anything else.
- Add your hard costs: props, product purchase, music licence, any paid tool.
- Add a margin, because a sponsored video is not the only thing you could have done with that time.

That number is your floor. It is not your price, but knowing it stops you accepting a deal you will resent by the second revision.

## Then price the access

Audience access has no universal rate — it depends on platform, niche, geography and how engaged the audience actually is. Anyone quoting you a fixed cost per thousand views for short-form is guessing, and you should not build a quote on their guess either.

What you can do instead, cheaply:

- **Ask two or three creators in your niche** what they charge for a similar deliverable. Most will tell you a range. This is the single most useful thing you can do, and almost nobody does it.
- **Track your own offers.** The first brand that approaches you has effectively told you your price is at least what they offered. Keep a record of every offer and every accepted rate; after a handful of deals you have real data rather than nerves.
- **Quote a range to new enquiries** and settle on a number once the scope is clear. A range invites a conversation; a single figure invites a comparison.

## Charge separately for the things that are not the video

The fee for one video with organic usage should not be the fee for one video the brand will run as a paid ad for six months. These are the extras worth line items:

- **Paid amplification or whitelisting.** The brand runs your video as an ad, often from your handle. This uses your name and your credibility, and it is the most commonly undervalued item on the list.
- **Exclusivity.** If they do not want you working with a competitor for a period, that period has a price, because it costs you other work.
- **Category exclusivity.** Narrower than full exclusivity, and much cheaper — they only block rival brands in their own category.
- **Extra videos or cutdowns.** A second version for a different platform is another deliverable, not a favour.
- **Raw footage.** Some brands want the source files. Charge for them, and say what they may not do with them.
- **Revisions beyond the agreed rounds.** Two rounds is normal. A third is scope.
- **Rush delivery.** A deadline inside your normal turnaround is a premium, not a default.

## Write the quote so it explains itself

A quote that a marketing manager can forward to their finance team without editing is worth more than a cheaper one they have to justify. Keep it to a page:

- What you will deliver, in concrete terms: number of videos, length range, platforms, posting dates.
- What the fee includes, and explicitly what it does not.
- Usage rights, stated as duration, territory and media, with anything beyond organic posting priced separately.
- Payment terms, including the deposit and the date the balance is due.
- Who approves what, and how many revision rounds are included.

The word "organic" should appear in your quote. It is the difference between a video and a campaign.

## Payment terms worth insisting on

- **A deposit before you shoot.** Half up front is common for a first deal with a new brand, and it is the norm in most creative work outside social media. If it is refused outright, that is information.
- **State net terms in days and name the date.** "Net 30" with an invoice date is clearer than "payment on completion" with no date attached.
- **Say what happens when it is late.** A stated late fee is rarely charged; it is there to make the payment date real.
- **Invoice properly.** A numbered invoice, your business details, the deliverable, the amount and the terms. Brands that pay slowly are frequently brands that were never given a clean invoice.

The guides in [how to batch produce a week of shorts](/blog/batch-produce-shorts) matter here too: a sponsored video that takes three sessions to make is a sponsored video you priced wrong.

## Red flags in the offer

- **"Exposure instead of payment."** Occasionally a genuine trade is worth it — a product you would have bought anyway, from a brand whose audience overlaps yours. Rarely anything else.
- **Perpetual, worldwide, all-media rights** in exchange for one post. That is buying your work outright, and it should cost like it.
- **Unlimited revisions.** You will be revising until someone gets bored.
- **No written brief.** Verbal scope always expands.
- **Payment on their timeline only**, with no date and no process for chasing it.

## Raising your rate

Raise it on new enquiries first, never retroactively on an agreed quote. A workable pattern: hold your rate for a set number of deals or months, then raise it for new clients and keep existing repeat clients at the old rate for one cycle as a courtesy. If every enquiry says yes immediately, your price is below the market and you should test higher on the next one.

And keep the record. Two numbers — what you quoted and what you were paid — turn pricing from guesswork into a trend line within a few months.
`,
  },
  {
    slug: 'short-form-media-kit',
    title: 'What Brands Want in a Creator Media Kit',
    description:
      'The one page that answers a brand’s questions before they ask: audience, formats, proof and terms, without a wall of vanity metrics.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# What Brands Want in a Creator Media Kit

A media kit exists to answer one question a brand is asking silently: can this person deliver the audience we need, reliably, without creating work for us?

Most kits answer a different question — how many followers do I have — and that is why they get ignored. Follower count is the least interesting number in a short-form kit, because it says nothing about whether anyone watches.

## One page, one document, always current

A PDF of one or two pages, plus the same information as a page on your site. Both, because some brand contacts want an attachment for their records and others want a link they can forward.

The date of last update should be visible. A kit that says "updated two years ago" reads as an account that may no longer be active.

## The numbers that actually persuade

Include these, in this order:

- **Platform and handle**, for each platform you are pitching. Separate kits per platform are better than one combined one, because reach on one does not transfer to another.
- **Audience size**, stated plainly. Do not round up; the first thing a brand does is check.
- **Average views and the typical range**, not your best video. A best-ever video tells them what happened once.
- **Completion or retention where the platform shows it.** This is the number that separates an engaged audience from a large passive one, and it is the number most creators leave out.
- **Saves and shares**, if you have them. Both signal intent, and brands increasingly care about them more than likes.
- **Audience location and age breakdown**, from the platform's own analytics, if it is available and flattering. If it is not, say what you do know rather than leaving a gap.

Leave out screenshots of follower counts, emoji-filled growth charts, and anything measured in percentages without a base. "Engagement up 400%" from a small base invites exactly the question you do not want.

## Two case studies beat ten bullet points

A case study is three lines: what the brand wanted, what you made, what happened. If you have never worked with a brand, use your own product or a video that performed — the structure is what matters, not the client name.

- **The brief.** One sentence. "Launch a new product to an audience that had never heard of it."
- **What you made.** One sentence plus a still or a link.
- **What happened.** The number they care about: views, click-throughs, code redemptions, whatever the brand's goal was.

Three of those will do more than any amount of copy about being authentic and passionate.

## Say what you actually offer

Brands arrive with a vague idea and leave with a deliverable. Make the menu explicit:

- **Formats.** Talking head, demo, unboxing, tutorial, series integration. Say which you are good at, not which you will attempt.
- **What one video includes.** Length range, captions, a hook in the first two seconds, one revision round, posting date.
- **What costs extra.** Paid amplification, exclusivity, raw footage, extra cutdowns, rush delivery.
- **Typical lead time.** How far ahead you need the brief.

Ambiguity here is what turns a straightforward booking into three weeks of email.

## Linking proof, not claiming it

Every claim in the kit should have somewhere to click. A retention figure links to the platform's analytics screenshot; a case study links to the video; the format examples link to real posts.

This matters more than the writing. A brand contact forwarding your kit internally is asked "is this real?", and links answer that faster than adjectives.

## Rates: state them or say they are on request

Both are defensible. What is not defensible is a kit with no indication at all, which produces enquiries that go nowhere once a number finally appears.

- **Stating a starting price** filters out most mismatched enquiries and signals you are a business.
- **"Rates on request"** is fine if you are negotiating per campaign, but then answer quickly — a slow first reply loses more deals than a high price.

If you state a price, state what it buys. A number with no scope invites an argument about scope later.

## The one-page layout, in order

If you are building the kit from scratch, this order works because it follows the questions a brand asks:

1. **Who you are, in one line.** Handle, platform, subject. Not a biography.
2. **Four numbers**, in a row: audience size, average views, completion or retention, saves and shares. Each with the period it covers.
3. **Two case studies.** Brief, video, result. Links included.
4. **What you offer.** Formats, what one video includes, what costs extra, lead time.
5. **Rate or rate on request.** With the scope it buys.
6. **Contact.** Email, time zone, response expectation.

That is a single page with room to breathe, and it can be read in ninety seconds — which is roughly how long a brand contact gives it before deciding whether to reply.

## When to build one

Before you have anything to put in it, a kit is a template with nothing to say. Build it the moment you have one video that performed and one number you are willing to defend. That is enough: two case studies can be the same video described two ways, or one real one and one made for your own product.

Waiting for a sponsorship before writing a kit is backwards. The kit is what makes the first pitch possible.

## Contact, and the smallest possible friction

One email address, checked, that goes to a human. Not a contact form with six fields. Include a response-time expectation if you can hold it, and your time zone, because a brand coordinating three creators needs to know when you will reply.

## The mistakes that get a kit ignored

1. **It is about you.** Three paragraphs of biography before a single number.
2. **Stale numbers.** A kit from last year with a handle you no longer use.
3. **Only follower count.** No views, no retention, no saves.
4. **Designed heavily, informative barely.** A beautiful template with no case study.
5. **No formats.** The brand has to ask what they can buy, which is work for them.
6. **No link to the actual work.** The fastest way to lose a serious enquiry.

## Keep it alive

Refresh the numbers every quarter, and immediately after any video that changes them materially. The single most common reason a good kit fails is that it described an account from a year ago.

A kit is also the natural home for the pricing method in [how to price a sponsored short](/blog/price-sponsored-shorts) — the two documents should not contradict each other, because brands read both.
`,
  },
  {
    slug: 'brand-outreach-without-a-following',
    title: 'How to Pitch a Brand Without a Following',
    description:
      'A pitch that sells a specific idea instead of asking for a chance, including who to contact, what to send, and what to do with a no.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# How to Pitch a Brand Without a Following

Small accounts get sponsored work. What they do not get is sponsored work by asking for it generically. "I have 800 followers and I love your products, would you sponsor me?" asks a brand to do all the thinking — to imagine the video, judge the fit and invent a budget — for someone they have never heard of.

The pitch that works does that thinking for them, and it leads with the idea rather than the follower count.

## The reframe: you are solving a marketing problem

A brand does not buy videos. It buys a specific outcome: a launch seen by the right people, a product demonstrated properly, a category explained to an audience that does not understand it yet.

So before writing anything, answer three questions about the brand:

1. **What are they currently posting?** Look at their last twenty posts. What format are they using, and what are they clearly not doing?
2. **Who are they already working with?** Big polished creators, or small niche ones? That tells you the budget shape and the door to knock on.
3. **What is missing?** A product nobody has demonstrated, a feature nobody has explained, an audience they have not reached. That gap is your pitch.

If you cannot answer the third question, you do not have a pitch yet — you have an introduction, and introductions go in the bin.

## Make one video before you ask

A single spec video — the ad you think they should run, made on your own initiative — converts far better than any amount of description. It has three properties that a pitch email cannot have:

- It proves you can make the thing, at the quality you claim.
- It shows the idea rather than describing it.
- It costs them nothing to judge.

One video, for one brand, about one product. Not five. The specificity is the whole point: a spec video for a brand you clearly studied is a compliment; the same video sent to fifteen companies is spam.

If you cannot get the product, make the video about the problem the product solves, using what you have. The demonstration of understanding matters more than the product being in shot.

## The pitch itself

Short, specific, and structured so it can be answered in one line.

- **Subject line** naming the specific idea, not "Collaboration opportunity".
- **Two sentences of context:** who you are, in terms of audience and subject, not follower count.
- **The idea:** one paragraph describing the video, with a link to the spec video if you made one.
- **Why you:** one sentence on why your audience is the right one, with a number if you have one.
- **What you need:** product, budget range, timeline. Ask for one clear next step.

Under two hundred words. Every additional paragraph reduces the chance of a reply.

## Who to contact

Not the general enquiries inbox, where pitches go to be read by nobody. Look for the person who owns social or influencer marketing: their name is often on the brand's LinkedIn, in a press page, or on the account of whoever runs their socials.

If you genuinely cannot find a name, the general inbox is fine — but address it to the marketing team and make the subject line do the work, because a shared inbox is a queue.

## Follow up once, then stop

One follow-up, seven to ten days later, adding something rather than repeating the ask: a new idea, a relevant video that performed, a note that the spec video is now live.

After that, stop. A second follow-up rarely works and costs you the option of pitching them again next quarter, which is a real thing that happens — timing is the most common reason a good pitch is ignored.

## Small brands first, and why

A brand with one marketing person can make a decision in a day, and often wants the kind of specific demonstration a bigger brand's process cannot accommodate. That is where an unknown account gets its first deals.

The sequence that works: two or three small brands at a rate you would accept, used to build the case studies, then the same pitch with proof attached to mid-size brands. The proof is what changes the reply rate, and it can only come from the first group.

## Choosing the first five brands

Do not start with the brands everyone wants. Start with a list you can research in an afternoon:

- **Brands whose product you already use.** You can demonstrate it without a script, and the enthusiasm is real.
- **Brands advertising to your exact audience** but visibly not reaching them. Look at who they sponsor: if everyone on their roster has a million followers, they are buying reach and you are not the answer — yet.
- **Brands small enough to reply.** A company with one marketing person answers email. A company with a department does not.
- **Brands whose existing content is weak.** If their product has never been demonstrated well on video, that gap is your pitch, and it is the easiest one to write.

Five is enough for a first round. More than that and the research stops being real and the pitches become identical, which is the failure mode this whole approach exists to avoid.

## Pricing in the first conversation

Have a number ready even if you are nervous about it. "What is your budget?" is a reasonable question, but answering it with a question of your own reads as unprepared, and some brands will simply name a low figure to see whether you accept it.

Say the number, then say what it includes. The method is in [how to price a sponsored short](/blog/price-sponsored-shorts); the media kit that supports it is in [what brands want in a media kit](/blog/short-form-media-kit).

## What to do with a no

- **"No budget right now."** Ask to be kept on file, and pitch again when they launch something. This one often turns into a yes.
- **"We only work with bigger accounts."** Accept it and move on. Arguing this point has never worked.
- **No reply at all.** The most common outcome, and usually about timing and inbox volume rather than your pitch.
- **A no after a spec video.** You still have a video you can post on your own account, which is the reason to make one you would be happy to publish anyway.

## Track it

A simple list: brand, contact, date sent, idea, outcome, follow-up date. Ten rows will teach you more about what works than any advice, because your niche has its own patterns and yours will differ from everyone else's.

Outreach is a volume game with a quality floor. Ten well-researched pitches beat a hundred identical emails, and the tenth one is where the first yes usually comes from.
`,
  },
  {
    slug: 'brand-deal-terms',
    title: 'Brand Deal Terms Worth Reading Twice',
    description:
      'The clauses that decide what a sponsored video really costs you: usage rights, exclusivity, approvals, payment timing and who owns the footage.',
    date: '2026-11-06',
    category: 'Strategy',
    content: `
# Brand Deal Terms Worth Reading Twice

A brand deal is usually two pages and one of them decides your next twelve months. The fee is the easiest part to negotiate and the least consequential; the clauses around it determine whether you can work with a competitor, how long your face appears in someone else's advertising, and when you get paid.

This is not legal advice, and a contract worth real money should be read by someone qualified. But most creator deals are small enough that nobody hires a lawyer, so it is worth knowing which clauses to slow down on.

## Usage rights are the clause that matters

Usage rights say what the brand may do with your video. They are described with four dimensions, and a vague sentence hides all four:

- **Duration.** Thirty days is normal for a social campaign. Perpetual means forever, and should be priced like buying the work.
- **Territory.** Your country, or worldwide. Worldwide is broader and worth more.
- **Media.** Organic social only, or also paid ads, their website, email, retail screens, television. Each expansion costs something.
- **Whitelisting or paid amplification.** Running the ad from your handle, using your name and credibility. This is the most valuable permission you can grant short of full ownership, and it is the one most often buried in a sentence like "brand may boost the content".

Read the sentence that says what happens after you post. If it does not name a duration, ask.

## Exclusivity: the hidden cost

Exclusivity stops you working with competitors. Two things to check:

- **Scope.** Full category exclusivity blocks every rival. Narrower, product-specific exclusivity blocks less and costs less.
- **Duration.** Thirty days is a campaign. Twelve months is a year of income you have agreed not to earn.

If a brand asks for a long exclusivity window, either price it explicitly or propose a shorter one. Most will accept thirty days, because their campaign is thirty days.

## Approvals and revisions

A brand that can reject indefinitely can hold your video hostage to an internal process you cannot see. The clause should say:

- **How many approval rounds** are included. Two is standard: first cut, then final.
- **How long they have to respond.** A stated window — say five business days — is what stops a video sitting in someone's inbox for a month.
- **What happens if they do not respond** in that window. Silence should count as approval, and a well-drafted clause says so.

Without a response window, your posting date is controlled by someone who has no reason to hurry.

## Payment terms

Check five things in the payment clause:

1. **The amount, with any tax treatment stated.**
2. **The schedule.** On delivery, on posting, or on invoice — these are different dates.
3. **The number of days**, counted from a named event, not "upon completion".
4. **Whether a deposit applies.** For a first deal with a new brand, a deposit before shooting is reasonable.
5. **What happens on cancellation.** A kill fee for work already started is normal in creative industries and worth asking for.

If late payment has no consequence, it will happen, and chasing it costs you more in attention than the fee was worth.

## Who owns the footage

You shot it, so you own it — unless the contract says otherwise. Two things to protect:

- **The raw files.** Sending them is a deliverable, not a formality, and it should be named and priced.
- **Your right to reuse it.** A portfolio clause lets you show the work and post it on your own account. Without one, some brands can ask you to take it down.

A simple sentence — "creator retains ownership; brand receives a licence for the uses listed above" — is the whole protection.

## Disclosure is your obligation, not theirs

Paid partnerships must be disclosed clearly, in the video or caption, in language an ordinary viewer understands. In the United States the FTC's endorsement guidance covers this; the UK, EU, Australia and Canada have equivalents, and platforms add their own paid-partnership tools on top.

The contract often says the brand will handle disclosure, or says nothing. Neither transfers the obligation: the disclosure is the creator's responsibility, and an unclear "#collab" buried under thirty hashtags is not disclosure.

So state in the contract that you will disclose, and disclose in plain words — "paid partnership with" is unambiguous.

## Clauses worth pushing back on

- **Perpetual, worldwide, all-media rights** for a single post.
- **Unlimited revisions.**
- **Approval of your other content**, which is a control clause wearing a quality argument.
- **Indemnity covering the brand's own claims**, so you absorb liability for statements they wrote.
- **Exclusivity longer than the campaign.**
- **"Brand may use creator's likeness"** with no scope or end date.

Pick the two that matter most and negotiate those. Trying to renegotiate every clause on a small deal signals that the deal is not worth their time.

## When they send their own contract

Most mid-size and larger brands will send their standard agreement rather than accept yours. That is normal, and it does not mean the terms are fixed.

What to do, in order:

1. **Find the usage and exclusivity clauses first.** Those are the two that cost money later, and they are usually in different sections.
2. **Send back a short list of specific amendments**, numbered, in writing. "Clause 4: reduce the licence term from perpetual to 90 days" is a request a legal team can process. "I am not happy with the rights section" is not.
3. **Offer a trade rather than a refusal.** A shorter licence term in exchange for a slightly lower fee is often accepted, because the brand's real need is usually the campaign window.
4. **Ask for the amendment in the contract, not in an email beside it.** A side email saying "we will only use it for 30 days" does not override a perpetual clause.

If the deal is small and the contract is long, a two-line confirmation email is a better instrument than signing a ten-page document you have not read. If it is not small, and the terms matter, that is the point at which paying someone qualified to read it is cheaper than the clause you would otherwise sign.

## Get it in writing, even when it is small

A short email confirming the deliverable, the fee, the posting date, the usage rights and the payment date is a contract for practical purposes. Many small deals run on exactly that, and the ones that go wrong are the ones conducted entirely in DMs.

Keep the emails with the project files, as described in [how to organize video projects](/blog/organize-video-projects). The day a brand asks you to take a video down, the terms you agreed are the only thing that settles it.
`,
  },
  {
    slug: 'affiliate-links-in-shorts',
    title: 'How to Use Affiliate Links in Short Videos',
    description:
      'Where a link can actually live in short-form, how to disclose it, what converts, and why most affiliate links earn nothing.',
    date: '2026-11-06',
    category: 'Tutorial',
    content: `
# How to Use Affiliate Links in Short Videos

Affiliate links are the most accessible way to earn from short-form video and the most commonly wasted. The mechanical reason is simple: there is no clickable link inside a short. Everything depends on a viewer deciding, after watching, to open your profile and follow a link — and most never do.

Understanding that constraint changes how the videos are made, not just how the links are placed.

## Where a link can actually live

- **The bio or profile link.** One link, and every platform treats it differently. A single link page listing a few products is the usual solution, and it works best when the number of options is small.
- **A pinned comment.** Some platforms allow it and some suppress links. Where it works, it is the closest thing to an in-video link.
- **The platform's own shopping features.** Where they exist, they keep the viewer inside the app and remove the friction entirely. Availability varies by country and account type, so check what your account actually has rather than what a guide says.
- **A link in a longer description**, on platforms that show one.

If you are relying on the bio link, say so in the video: "the link is in my bio" spoken once, near the end, is worth more than a caption nobody scrolls to.

## Disclosure comes first, literally

The rule in most markets is that a paid or incentivised recommendation must be disclosed clearly, and the disclosure must come before the link rather than in small print after it.

- Say it in the video if the recommendation is spoken: "this is an affiliate link, I earn from it".
- Label it in text where the link is: "affiliate" next to the product name.
- Use the platform's paid-partnership toggle where it exists, and still say it in words.

Vague wording — "collab", "sp", a single asterisk with no explanation — is the thing regulators have repeatedly said does not count. Plain language does.

The specifics vary by country: the FTC's endorsement guidance in the United States, the ASA's rules in the UK, and equivalents elsewhere. Check the rules that apply to you and to your audience, because both can matter.

## Choose products you would recommend unpaid

Affiliate marketing fails when the recommendation is not believable, and viewers detect it faster than any algorithm.

The version that works: one product per video, demonstrated doing the specific thing you claim it does. Not a list, not a haul, not five products mentioned in thirty seconds. A single demonstration is also easier to make well, which matters because the video has to work as a video before it works as an advertisement.

If you would not recommend it to a friend, the commission is not worth the trust it costs. Audiences forgive a lot; they do not forgive being sold something bad.

## Make the link trackable

- **One short link per platform**, so you can tell where clicks came from.
- **Tag campaigns** if the affiliate programme supports it, so a video and a bio link are distinguishable in the reports.
- **Check the link works** before publishing, and again a month later. Expired links are the quiet killer of affiliate income: the video keeps getting views and earns nothing.

That last point is maintenance, not marketing. A quarterly pass over every video with a link in it, checking each destination still resolves to the right product, is the highest-return hour in the whole process.

## What actually converts

- **A specific problem solved on camera.** "This is how I got the audio clean" beats "here are my filming essentials".
- **The product visible doing the job**, not held up next to a face.
- **One call to action, once.** Repeated asks read as desperation and reduce completion, which is the metric the platform uses to decide who sees the video.
- **A price-appropriate product.** A recommendation that costs more than the viewer expected has to justify itself twice.

Expect low click-through. Short-form is a discovery format, not a shopping format: the viewer came for the idea, not the product. A small number of clicks from a lot of views is normal, and it is why affiliate income from shorts tends to be a supplement rather than a salary.

## Where affiliate works, and where it does not

It works when the product is the subject: tools, gear, software, kitchen equipment, anything demonstrable. It works poorly when the product is incidental to the content, because the viewer has no reason to want it.

It also depends on the programme's terms — commission rate, cookie window and whether the merchant honours the tracking. Those vary enormously between programmes, and a high commission from a merchant that never confirms a sale is worth less than a low one that does.

## Common mistakes

1. **A link page with twenty products.** The viewer wanted one.
2. **No disclosure**, or disclosure after the link.
3. **Dead links** left in old videos.
4. **Products never used on camera.**
5. **Affiliate links to something you have never bought**, which the audience can usually tell.
6. **Treating it as passive income.** The videos still have to be good, and the links still have to be maintained.

## Choosing a programme

Three questions decide whether a programme is worth your time, and none of them is the headline commission rate:

- **Does it confirm sales?** A programme that reports clicks but never conversions gives you no way to know whether the video earned anything, and no way to improve it.
- **How long does the tracking last?** The window between a click and a purchase decides how many of those purchases you are credited for. A short window suits impulse buys; a long one suits considered purchases.
- **Does the merchant honour it?** This is the one you cannot read on a signup page and must learn from other creators or from your own first payout.

Apply to the programmes for products you already recommend, not the ones with the biggest advertised rate. A five percent commission that pays is worth more than thirty percent that never confirms.

Many creators end up in two places: one large marketplace that carries many merchants, and one or two direct brand programmes for the products they use most. That combination covers most recommendations without requiring a dozen dashboards.

## Keep the records

For each video with a link: the product, the programme, the link, the date published, and the disclosure used. When a merchant disputes a conversion or a platform asks about a partnership, that record is the answer.

If the recommendation is a real one, the video is the same video you would have made without the commission — and that is the test worth applying before publishing. The commercial side of a creator business, from pricing to contracts, is covered across [how to price a sponsored short](/blog/price-sponsored-shorts) and [brand deal terms worth reading twice](/blog/brand-deal-terms).
`,
  },
];
