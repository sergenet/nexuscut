import type { BlogPostLike } from '@/lib/blogData';

/**
 * Five long-form guides added 2026-11-06 to give the blog real depth.
 *
 * The site was rejected by AdSense for "low value content" while its median
 * post ran about 450 words. These are written as standalone answers — a reader
 * who never opens the editor should still get the whole method — because that
 * is what the rejection is actually about.
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
];
