import type { BlogPostLike } from '@/lib/blogData';

/**
 * Ten long-form guides added 2026-11-06 in two rounds, to give the blog real
 * depth.
 *
 * The site was rejected by AdSense for "low value content" while its median
 * post ran about 450 words. These are written as standalone answers — a reader
 * who never opens the editor should still get the whole method — because that
 * is what the rejection is actually about.
 *
 * Round one covers making one clip: podcast repurposing, safe zones, caption
 * readability, Shorts length, audio repair. Round two covers the work around
 * it: batching, export settings, file organisation, rights, publishing. The
 * two rounds deliberately do not overlap in subject, so they compete for
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
];
