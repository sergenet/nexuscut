import {
  getSoroDraftBySlug,
  listPublishedSoroPosts,
  sanitizeHtml,
  type SoroBlogPost,
} from '@/lib/soroBlog';
import { guidePosts } from '@/lib/blogGuides2026';

export interface BlogPostLike {
  slug: string;
  title: string;
  description: string;
  date: Date | string;
  category: string;
  content: string;
  image?: string | null;
  imageAlt?: string | null;
}

/**
 * A post whose date is in the future is scheduled: it stays out of the
 * index, slug list, and sitemap until its date arrives. Blog pages
 * revalidate every 60 seconds, so it becomes visible on its own.
 */
function isScheduled(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const time = new Date(date).getTime();
  return Number.isFinite(time) && time > Date.now();
}

/**
 * Returns every blog slug the site should be able to render at build time.
 * Static slugs come first, then any published Soro drafts. Scheduled posts
 * are omitted so a future post is neither built nor listed early.
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const staticSlugs = blogPosts
    .filter((post) => !isScheduled(post.date))
    .map((post) => post.slug);
  const soroPosts = await listPublishedSoroPosts({ take: 200 });
  const soroSlugs = soroPosts
    .filter((post) => !isScheduled(post.publishedAt))
    .map((post) => post.slug);
  return [...new Set([...staticSlugs, ...soroSlugs])];
}

/**
 * Blog post lookup used by the [slug] route. Static posts win first;
 * published Soro drafts are the fallback content source.
 */
export async function getBlogPostBySlug(slug: string): Promise<SoroBlogPost | null> {
  const match = blogPosts.find((post) => post.slug === slug);
  if (match) {
    if (isScheduled(match.date)) return null;
    return {
      id: match.slug,
      slug: match.slug,
      title: match.title,
      description: match.description,
      content: match.content,
      publishedAt: match.date instanceof Date ? match.date : new Date(match.date),
      importedAt: match.date instanceof Date ? match.date : new Date(match.date),
      importedBy: 'static',
      sourceUrl: null,
      category: match.category,
      image: match.image ?? null,
      imageAlt: match.imageAlt ?? null,
    } satisfies SoroBlogPost;
  }

  const soroDraft = await getSoroDraftBySlug(slug);
  if (!soroDraft || soroDraft.status !== 'published') {
    return null;
  }
  if (isScheduled(soroDraft.publishedAt)) {
    return null;
  }

  return {
    id: soroDraft.id,
    slug: soroDraft.slug ?? slug,
    title: soroDraft.title,
    description: soroDraft.excerpt ?? soroDraft.title,
    // Soro stores raw HTML; sanitize it once here so every consumer can
    // render `content` directly.
    content: sanitizeHtml(soroDraft.contentHtml),
    publishedAt: soroDraft.publishedAt,
    importedAt: soroDraft.importedAt,
    importedBy: 'soro-import',
    sourceUrl: soroDraft.sourceUrl ?? null,
    category: 'Soro digest',
  } satisfies SoroBlogPost;
}

/**
 * Async wrapper used by the blog index page. Static posts come first,
 * then published Soro drafts, both rendered through the same card shape.
 */
export async function getBlogPostSummaries(
  options?: { take?: number },
): Promise<(SoroBlogPost | BlogPostLike)[]> {
  const take = options?.take ?? 50;
  const soroPosts = await listPublishedSoroPosts({ take });
  const visibleStatic = blogPosts.filter((post) => !isScheduled(post.date));
  const visibleSoro = soroPosts.filter((post) => !isScheduled(post.publishedAt));
  return [...visibleStatic, ...visibleSoro];
}

/** Re-export for pages that only need the static fallback. */
export function getStaticBlogPost(slug: string): BlogPostLike | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export const blogPosts: BlogPostLike[] = [
  // Five long-form guides added 2026-11-06; newest first, matching the order
  // this array has always used.
  ...guidePosts,
  {
    slug: 'ai-powered-short-form-video-editor',
    title: 'AI Short-Form Video Editor That Stays Editable',
    description: 'Use AI to move faster on captions and silence cuts—while keeping full control of every cut, caption, and layer.',
    date: '2026-08-16',
    category: 'Workflow',
    image: '/blog/ai-powered-short-form-video-editor-workflow.png',
    imageAlt: 'NexusCut browser editor with its multi-track timeline, captions, and editing tools visible.',
    content: `
# AI Powered Short Form Video Editor That Stays Editable

A raw interview, screen recording, or podcast can contain several moments worth turning into short-form clips. Finding those moments is only half the job. The real work is shaping each one into a clear vertical video without flattening your personality into a generic auto-generated template.

An AI-powered short-form video editor should remove repetitive work while leaving editorial decisions with you. For creators publishing to TikTok, YouTube Shorts, and Instagram Reels, fast output is useful—but a finished video you cannot revise is not.

## What AI Should Actually Do

AI is most useful when it handles work that is tedious but not creatively defining. It can help you generate captions, identify silence and dead air, and speed up the rough edit. You should still decide what stays, what gets cut, where the text appears, and how the finished video feels.

Not every pause should disappear. A beat before a punchline can make it land; a brief pause after a complicated idea can let viewers absorb it. Auto captions can get you moving quickly, but final wording, timing, line breaks, and visual style still affect clarity.

Think of AI as an assistant editor with a narrow assignment: clear repetitive work out of the way. You remain the editor who decides what the audience sees, hears, and feels.

## Why a Real Timeline Matters

Some tools offer a one-click path from a long video to a stack of clips. That can be useful for generating starting points, but it becomes a problem when a clip opens too late, cuts away context, uses awkward caption breaks, or removes a purposeful pause.

A multi-track timeline gives you a practical way to fix those choices. You can split clips around a stronger opening, trim a section, add a text layer at the right moment, place voiceover or music on a separate audio track, and control pacing shot by shot.

For a creator who posts regularly, editability is not an extra feature. It is how your videos continue to sound and look like yours.

## A Better Workflow for Turning Raw Footage Into Shorts

### 1. Start with the strongest opening

The first line must make sense without the surrounding conversation. “That is exactly right” may work in a full interview but says nothing in a feed. Find the sentence where the speaker makes a claim, asks a useful question, or creates tension—then cut the unnecessary setup.

Do not force every clip into a dramatic hook. Educational creators often do better with a direct promise, such as: “Here is how I plan a week of social posts in 30 minutes.” The goal is clarity, not manufactured hype.

### 2. Use silence removal as a rough pass, then listen again

Silence removal can clean up repeated starts and dead space in a talking-head recording, podcast, webinar, or tutorial. Review the result before moving on. Keep pauses that create emphasis, separate steps, or make a story feel human.

Aggressively removing every bit of space can make speech feel rushed and captions harder to follow. The right pacing depends on the speaker, topic, and audience.

### 3. Generate captions early enough to edit with them

Captions are part of the edit, not decoration at the finish line. After generating [auto captions](/blog/auto-captions-guide), scan for proper names, product terms, numbers, and words the transcript may have misunderstood. Then look at timing and line breaks.

Use a readable font, strong contrast, and placement that does not cover a face or important screen detail. Keep a consistent style across your series, but adjust the position when the footage needs it.

### 4. Add visual changes only when they support the point

Short-form pacing does not require a cut every second. Use cuts to remove repetition, screen recordings when you reference a process, and text callouts when a detail needs emphasis. More layers do not automatically make a video more engaging.

For a product demo, the timeline might include the host on the video track, a screen capture layered above it, captions, and a simple text callout. For a podcast clip, a tighter crop, captions, and a few deliberate cuts may be enough.

## Build an Editing System, Not a One-Off Process

Creators who publish consistently do not make every project from zero. They use repeatable decisions: a preferred vertical canvas, two caption styles, a standard intro treatment, and a simple export checklist.

With NexusCut, you can record camera or screen footage, upload video, edit in a multi-track timeline, generate captions, remove silence, add voiceover or text, and export in your browser. Save the project locally when you want to return for revisions or make another version for a different platform.

Before posting, make one final human pass: check captions against the audio, watch the first three seconds with sound off, listen for cuts that change a sentence’s meaning, and confirm key text stays in the visible area of the frame.

## AI Helps You Move Faster. You Keep Control.

The smart choice is not AI *or* manual editing. It is using the right amount of each for the video in front of you. Let AI clear repetitive obstacles, then spend your attention on the moments viewers will remember.

[Start the free NexusCut Creator Challenge](/creator-challenge) to record or upload a clip, edit it on a timeline, add captions, and export your result.
    `,
  },
  {
    slug: 'auto-captions-guide',
    title: 'How to Add Auto Captions to TikTok Videos',
    description: 'A complete guide to adding animated, accurate captions to your TikToks.',
    date: '2026-07-15',
    category: 'Tutorial',
    content: `
# Auto Captions: Getting Them Right Instead of Just Getting Them

Automatic captions have gone from a novelty to a default in about three years. That is a problem, because the default result is a verbatim transcript in a default style, and a verbatim transcript is not what captions are for.

This guide is about the step after generation: what to fix, in what order, and how to set up a caption style once so that every future video needs five minutes of work instead of thirty.

## What auto captions actually produce

The model outputs a transcript with word-level timings. That is all. Everything that makes captions watchable is decided afterwards, by you or by a preset:

- which words exist (filler, false starts, repeated words)
- how the text is broken into lines
- how long each line is on screen
- where it sits in the frame
- how it is emphasised
- whether it is coloured, animated, or boxed

A video with a transcript that is 98% accurate and a style that is unreadable is worse than a video with 90% accuracy and a clean style. Accuracy is the easy part now; presentation is where captions succeed or fail.

## The correction pass, in priority order

Do these in this order, because later steps depend on earlier ones.

1. **Names and nouns.** The most damaging errors, because a wrong name is instantly visible to the one person who cares and unfixable in comments. Check every proper noun.
2. **Numbers.** "Fifteen" versus "fifty" changes the meaning, and both are plausible predictions.
3. **Domain vocabulary.** Every niche has words the model has never seen in context. Fix them once and add them to a custom vocabulary if your tool supports it.
4. **Filler and false starts.** Remove "um", "uh", repeated words, and abandoned sentence openings. This is the step that turns a transcript into captions, and it is also the step most creators skip.
5. **Sentence breaks.** Break long spoken sentences into readable lines. A caption line is not a sentence; it is a unit the eye can take in during the time it is on screen.
6. **Emphasis.** Mark the words that carry the argument, and leave everything else plain.

If you only have time for two of those, do filler removal and sentence breaks. They produce the largest visible improvement per minute spent.

## Setting the style once

The reason caption work feels endless is that most creators re-decide the style for every video. Decide it once, in this order, and save it.

**Position.** Lower third, clear of the app's interface. The exact margins are in [vertical video safe zones](/blog/vertical-video-safe-zones), and they differ between TikTok, Reels and Shorts in ways that matter.

**Line length.** Around 32 to 38 characters. Two lines maximum. Longer lines force the eye to jump back and lose its place.

**Weight and contrast.** Bold enough to read over movement, with a shadow or stroke rather than relying on pure white. White text on a bright frame is unreadable in daylight, which is where most feed browsing happens.

**Animation.** One movement per line. A pop on each new line is enough. Animating every word makes reading impossible at speed.

**Case.** All caps for two or three words; sentence case for anything longer.

**Colour.** One accent colour for emphasis, matching your brand. More than one accent reads as noise.

Save that as a preset and never open the styling panel again unless you are deliberately changing direction. Style decisions made per video are how a channel ends up looking like five different channels.

## Reading speed is the hidden constraint

The caption has to be readable in the time it is on screen. A useful working rule: the average viewer reads about 200 to 250 words per minute for comfortable comprehension, which is roughly 3 to 4 words per second at a glance. If your speaker is doing 180 words a minute and you are showing six words at a time, each chunk needs about 1.2 seconds on screen to be comfortable.

Where this breaks:

- **Fast speakers.** The captions outrun the reading. Fix by shortening lines further, not by speeding up the display.
- **Long pauses.** Captions that linger feel stuck. Cut them on the pause.
- **Numbers and URLs.** These need double the hold time; nobody parses a URL at 4 words per second.

If you want the deeper version of this, including how caption timing interacts with retention, see [caption readability](/blog/caption-readability-guide).

## The transcript is also your script

The least-used benefit of auto captions: the corrected transcript is a clean, searchable record of what you said. Three uses that pay for the correction time.

- **Repurposing.** The corrected transcript is a shot list. Scan it for the turns and you have your clips: [repurposing long videos](/blog/repurposing-long-videos).
- **Descriptions and titles.** The strongest sentence in the transcript is usually a better title than anything you would write cold.
- **Search.** Your own archive becomes queryable by phrase, which matters once you have fifty videos.

## Common failures and their causes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Captions lag behind the audio | Whole-file timing drift | Re-time from a clear marker, or re-run generation on the audio alone |
| Captions flash too fast to read | Too many words per chunk | Shorten lines, hold longer |
| Captions cover the subject's face | Fixed position, moving subject | Move the block per shot, or use a style that sits lower |
| Text disappears behind the interface | Ignored safe zones | Raise the baseline |
| Shifted captions after a trim | Captions not linked to the cut | Re-link or regenerate after the final cut |
| Names consistently wrong | No custom vocabulary | Add the terms once |
| Different look on every video | No saved preset | Build one preset and reuse it |

## Captions are not subtitles

One distinction worth keeping straight, because it changes the writing: subtitles exist to make audio accessible, so they are verbatim and complete. Captions in short-form also exist to hold attention, so they are edited: filler removed, sentences tightened, emphasis added. Accessibility is still the floor, which is why removing filler is safe (the meaning is intact) and removing information is not.

If you are captioning for accessibility compliance rather than for the feed, keep the verbatim transcript available as the description or as a separate file. The two jobs have different outputs from the same source.

## The five-minute routine

Once the style is saved, the whole job looks like this:

1. Generate captions on the final cut, not the rough cut.
2. Fix names, numbers, and domain words.
3. Strip filler and false starts.
4. Break long lines.
5. Emphasis on the load-bearing words only.
6. Watch once, on your phone, sound off, in daylight.
7. Export.

Seven steps, five minutes, and it is the difference between captions that help and captions that make the video feel automated. For the export side, [export settings for vertical video](/blog/export-settings-vertical-video) covers bitrate and the compression artefacts that ruin burned-in text.
    `
  },
  {
    slug: 'ai-background-removal',
    title: 'How Still-Image Background Removal Works',
    description: 'Learn how a background-removal service creates a transparent PNG from a still image.',
    date: '2026-07-10',
    category: 'Technology',
    content: `
# AI Background Removal: What It Fixes and What It Cannot

Background removal is the most over-promised feature in consumer video editing. The demo is always a person on a clean backdrop, extracted perfectly, dropped onto something dramatic. The reality is hair, motion blur, translucent objects and a subject who keeps drifting toward the edge of the frame.

None of that makes the tool useless. It makes it a tool with a specific shape: it solves a lighting and logistics problem, and it cannot solve a shooting problem. Knowing which one you have saves hours.

## How it actually works

Every background removal tool, including the one in NexusCut, does the same thing under the hood: it predicts a mask. For each pixel, a segmentation model decides how likely it is to belong to the subject, then the edges of that mask are feathered so the composite does not look like a cut-out.

That has three consequences worth internalising.

1. **Edges are probabilistic.** A hard, high-contrast edge between subject and background gives the model an easy decision. A soft, low-contrast edge gives it a guess.
2. **Motion makes it harder.** Between two frames, the mask can flicker, and a mask that flickers at the edge of hair or a fast-moving hand looks like an artefact even when the average accuracy is high.
3. **It has no idea what the subject is.** It removes what it thinks is background. If your subject is holding something translucent, or wearing a colour close to the wall behind them, the model may take part of the subject with it.

## Shoot for the mask, not against it

The single biggest improvement to background removal results happens before the shoot. Six things matter.

**Separate the subject from the background in brightness.** If the wall behind you is the same brightness as your face, the model has almost nothing to work with. A backlight, a coloured wall, or simply moving two metres further from the wall fixes this more reliably than any slider.

**Keep the background simple.** A plain wall beats a bookshelf, which beats a window onto a street. Busy backgrounds are not just harder to mask; they also create edges the composite has to invent.

**Light the subject, not the room.** The classic mistake is lighting the space so the whole frame is evenly exposed. Even exposure flattens the difference between subject and background.

**Keep the subject clear of the frame edge.** A shoulder touching the frame edge is a mask boundary the model has to guess at. Step back.

**Hold the camera still, or move it smoothly.** Handheld micro-shake makes the mask breathe.

**Avoid translucent and reflective props.** Glasses, plastic cups, thin fabrics, and anything glossy will fight the mask.

## When to remove, when to reshoot, when to blur

Three options, and the best one depends on what the background is doing to the video.

**Remove it** when the background is a liability: a messy room, a distracting passer-by, an office that says the wrong thing about the brand, a window blowing out the exposure. It is also the right call when you need the subject composited onto a designed background, a product shot, or a graphic.

**Blur it** when the background is neutral but slightly distracting, and when you want the video to still read as a real place. Blur keeps the context and removes the noise, and it is far more forgiving than extraction because nothing has to be cut out.

**Reshoot** when the video depends on the background being believable and the extraction keeps failing. A five-minute reshoot against a plain wall beats forty minutes of edge repair, every time.

## The three common jobs

### Talking head for social

The goal is removal without it looking removed. That means matching the light direction of the new background to the light on the subject, and it means adding a shadow or a contact edge. A person floating on a bright gradient with no shadow reads as fake within a second.

Practical order: remove background, place subject, add a soft drop shadow with a slight offset matching the original key light, then match grain and colour temperature. If the composite is still obvious, reduce the subject size slightly so the eye has more context to read.

### Product shots

Clean extraction is easier here because products have hard edges and you control the lighting. The failure mode is different: reflections. A glossy product that had a reflection in the original shot will look pasted once the reflection is removed with the background. Either remove reflections in camera (polariser, matte surface) or keep a subtle reflection and rebuild it.

### Thumbnails

This is the highest-leverage use and the least fussy: extraction does not need to be perfect at thumbnail size, and a cut-out subject on a designed background is the standard thumbnail grammar. Boundary errors that would be visible in motion are invisible in a 400-pixel-wide image.

## The compositing checklist

Removal gets you a subject on a transparent field. The composite is what makes it look real.

- **Light direction matches.** If the key light came from the left in the original, the new background should not be lit from the right.
- **Colour temperature matches.** A warm subject on a cool background reads as a cut-out.
- **There is a contact shadow.** Even a subtle one.
- **Grain matches.** Clean subject on grainy background is a giveaway.
- **The subject is not sharper than the plate.** Adding a touch of blur to a very sharp subject often helps.
- **The edge holds in motion.** Scrub through, do not judge a still.

## Where it goes wrong, and what to do

| Symptom | Usual cause | Fix |
| --- | --- | --- |
| Halo around hair | Soft edge, similar tones | Brighten the background, or accept a slight blur on the edge |
| Flickering outline | Handheld camera, motion blur | Stabilise, or reduce subject movement |
| Missing fingers or props | Low contrast between object and background | Reshoot, or mask manually around the prop |
| Subject looks pasted | No shadow, mismatched light | Add contact shadow, match temperature and grain |
| Edges crawl on export | Heavy compression | Export at higher bitrate: [export settings](/blog/export-settings-vertical-video) |

## The cost question

Extraction is cheap per frame and expensive per habit. If you find yourself removing the same background every week, the correct fix is a background you do not need to remove: a plain wall, a curtain, a painted panel behind the chair. Ten minutes of setup removes the step permanently, and the results look better than any model.

For the mechanics in NexusCut, see the [background removal tool](/tools/remove-background). If your extracted subject is fine but the audio is not, [fixing bad audio in Shorts](/blog/fix-bad-audio-shorts) covers the other half of the "this looks amateur" problem.
    `
  },
  {
    slug: 'best-ai-tools-for-tiktok',
    title: 'Best AI Tools for TikTok Creators in 2026',
    description: 'A practical overview of AI-assisted tools for a short-form editing workflow.',
    date: '2026-07-05',
    category: 'Listicle',
    content: `
# Choosing AI Tools for TikTok Without Collecting Subscriptions

The AI tool market for short-form video is enormous, mostly redundant, and priced per month. The average creator who "uses AI tools" is paying for four things that do one thing each, and using two of them. This is a guide to deciding what you actually need, in what order, and what to ignore.

It is deliberately not a ranking. Rankings age in weeks, and a tool that is best for a solo talking-head creator is the wrong tool for a two-person product channel.

## Start with the bottleneck, not the tool

Before opening a pricing page, name the step in your workflow that costs the most time. Almost every creator's answer falls into one of five buckets, and each has a different kind of fix.

| Bottleneck | What actually helps | What does not |
| --- | --- | --- |
| Cutting takes hours | A timeline that supports fast rough cuts, and a repeatable template | A tool that generates a video for you |
| Captions are slow to fix | Transcription accuracy, then a style preset you reuse | A second caption tool with more fonts |
| I do not know what to post | A list of five repeatable formats per week | An idea generator that outputs generic hooks |
| My videos look amateur | Lighting, audio, and one consistent caption style | Filters and transitions |
| I cannot keep up with output | Batching, templates, and scheduling | More tools |

Notice how few of those are solved by a new subscription. That is the point. The most common expensive mistake is buying a tool for a problem that is actually a workflow problem.

## The four categories worth paying for

If you are going to spend, spend here, in this order.

### 1. Editing with an editable timeline

The one non-negotiable. Whatever you use has to let you cut, move, trim and re-time clips quickly, and it has to export at a bitrate that does not turn your footage to mush. AI features are a bonus on top of that, never a replacement: a tool that produces a video you cannot adjust will produce a video you cannot fix.

NexusCut's [editor](/editor) is built around this: multitrack timeline first, AI tools as optional steps you invoke when they save time.

### 2. Captions you can correct

Auto-captions save time only if the correction step is fast. The measure is not accuracy percentage; it is how many seconds it takes to fix a wrong word. Two things matter more than the model: whether the transcript is editable as text, and whether your style preset persists across projects.

See [auto captions](/tools/auto-captions), and [caption readability](/blog/caption-readability-guide) for what the styling should be doing.

### 3. Audio cleanup

This is the highest-return AI feature in the entire stack, and the one creators skip. Viewers forgive soft footage; they do not forgive a room that sounds like a bathroom. Look for noise reduction, level matching, and a loudness target rather than a "studio sound" button with no controls.

### 4. One generative tool, used deliberately

Image or b-roll generation, used for thumbnails and backgrounds, not for the substance of the video. Its value is in replacing stock-photo hunting, not in replacing shooting.

## The categories to be suspicious of

**Auto-generated full videos.** They work for a narrow set of formats (facts, listicles, quote compilations), they are heavily saturated, and platforms increasingly discount them. They also cannot be fixed when they are wrong, which is most of the time.

**Idea generators.** They produce hooks that are grammatical and false, because they have no access to your audience or your experience. Ten minutes with a notebook beats them.

**Trend finders.** They tell you what is already saturated. By the time a trend appears in a trend tool, the window is usually half closed. The useful signal is in your own comment section.

**Voice cloning for your own voice.** Convenient for corrections, dangerous for trust. A cloned voice reading a script you would not have said is the fastest way to lose an audience that came for you.

**Anything with a watermark on the free tier.** You will either pay or post something that looks like an advertisement for the tool.

## The consolidation rule

Three tools, not eight. A workable stack:

1. **One editor** that does cutting, captions and export. Export quality matters: [export settings](/blog/export-settings-vertical-video).
2. **One audio processor**, built into the editor if possible.
3. **One scheduling and analytics surface** so you can see what worked without opening four dashboards.

Anything that does not fit one of those three slots has to justify itself against the cost of context-switching, which is higher than the subscription.

## What AI is genuinely good at here

Worth knowing, because it changes what you delegate:

- **First-pass transcription.** Reliable enough that correction is faster than typing.
- **Silence and filler removal.** Tedious, mechanical, and easy to get right.
- **Reframing a wide shot to vertical.** Getting better every year, still needs a check on faces.
- **Cutting on beat.** Good when the music is unambiguous.
- **Searching your own archive.** Underrated: finding the clip you remember but cannot place.
- **Variants.** Producing five caption styles to compare in one pass.

## What it is still bad at

- **Knowing what is interesting.** The judgement is the job.
- **Timing a joke.** Rhythm is the one thing models consistently flatten.
- **Taste under constraint.** It will happily put six effects on a two-second clip.
- **Anything requiring your face, your voice, or your reputation.** Those are the assets you cannot generate.

## A decision routine

1. Write down the step that took longest this week.
2. If a tool can halve it, and you would use it weekly, trial it for one week.
3. At the end of the week, check whether you actually used it. If not, cancel; do not keep it "for later."
4. Keep the stack at three tools. When adding a fourth, remove one.

That routine is boring, and it is the difference between a tool stack that pays for itself and a monthly bill that produces nothing.

For the editing side specifically, [editing vertical video for Reels](/blog/edit-vertical-videos-reels) covers the parts no tool will do for you, and [vanity metrics versus real signals](/blog/vanity-metrics-vs-real-signals) covers how to tell whether any of it is working.
    `
  },
  {
    slug: 'repurposing-long-videos',
    title: 'How to Repurpose Long Videos into Shorts',
    description: 'Turn your 1-hour podcast into 20 viral TikToks.',
    date: '2026-06-28',
    category: 'Strategy',
    content: `
# Repurposing Long Videos Into Shorts Without Losing the Point

Every long video you have already recorded contains somewhere between six and thirty Shorts. Most creators find two, because they look for the moments that were good in the long video rather than the moments that will work in a short one. Those are not the same thing.

A long video rewards patience: a build, a payoff, a satisfying arc. A short rewards immediacy: one idea, one turn, one reason to keep watching. Repurposing is the work of translating between those two grammars, and it is a skill, not a copy-paste operation.

## Why the obvious approach fails

The obvious approach is to open the timeline, find the part where you said something interesting, and cut thirty seconds around it. The result usually feels like a fragment: it starts mid-thought, it explains itself for twenty seconds, and it ends without a turn.

Three structural reasons:

1. **Long-form has wind-up.** The first fifteen seconds of any good long video are setup. In a short, wind-up is the whole video.
2. **Long-form earns context over minutes.** A short has about two seconds to establish who is talking and why it matters.
3. **Long-form pays off at the end.** A short has to pay off inside itself, which usually means the clip has to be reordered, not just trimmed.

## Find the beats, not the highlights

Before you cut anything, watch the long video once with a notebook and write down every moment where the argument turns. Not the funny bits, not the good lines: the turns. A turn is where a claim becomes a consequence, where a mistake becomes a lesson, where a question gets an answer.

For a forty-minute interview, that list is usually twelve to twenty entries. Each entry is a candidate Short, and each one needs three things to survive:

- **A stake.** Something at risk or at cost, stated in the first seconds.
- **A turn.** A change: before and after, wrong and right, cheap and expensive.
- **A close.** A line the viewer can repeat, or an action they can take.

If a candidate has a stake and a turn but no close, it will feel like it stops rather than ends. If it has a turn and a close but no stake, nobody gets far enough to see the turn.

## The five shapes

Most successful repurposed clips take one of five shapes. Naming the shape before you cut is the fastest way to a clip that holds together.

**The single claim.** One sentence, stated, then defended in twenty seconds. The strongest shape for interviews and commentary.

**The before and after.** Show the result, then show the process, or the reverse. Works for tutorials, transformations, and anything with a visible outcome.

**The list.** Three to five items, each one its own beat. The easiest shape to cut and the easiest to make boring, because a list with no stake is just a sequence.

**The correction.** You believed something; it was wrong; here is why. The most reliable shape for educational content, because the viewer gets a status change along with the information.

**The moment.** A single unbroken piece of action or reaction, with no narration at all. Requires the strongest footage and the least editing.

## Cutting for the short, not from it

Once you have a candidate and a shape, the cut is a rebuild rather than a trim.

**Start at the turn, not before it.** If the interesting part is the sentence where the claim lands, the clip starts on that sentence and the setup arrives afterwards, as a caption or a quick cut back.

**Cut the wind-up in the middle too.** Long-form allows a speaker to circle an idea. A short does not: for each sentence, ask whether the clip survives without it. Usually a third of them can go.

**Keep one jump per idea.** Jump cuts are not a flaw in short-form; they are punctuation. But five cuts in eight seconds reads as panic.

**Rewrite the opening line.** The speaker's first sentence in the long video was written to follow the previous thirty seconds. It will not work as a first sentence. Record a new one, or use on-screen text to do the work.

**End on the close, not on the outro.** The moment the point lands, stop. If the long video continued into "so yeah, that is basically it," that part is not in the short.

## One recording, many outputs

The efficient version of this is not "cut more clips." It is "record with the clips in mind."

- **Ask the question twice.** Once for the long-form flow, once as a standalone: "explain that as if this is the only thing someone watches." The second answer is usually the Short.
- **Take a two-minute summary at the end of every recording.** One idea per sentence, no preamble. That summary is six Shorts.
- **Keep a running list of quotable lines.** One line per note, with a timestamp. Cutting becomes selection instead of search.
- **Record vertical B-roll while the setup is still up.** Later, the vertical crop will need somewhere to look.

## The technical pass

Repurposed footage arrives in the wrong shape: 16:9, framed for a wide shot, with audio mixed for speakers.

- **Reframe deliberately.** Do not centre-crop a two-shot; choose the subject and follow them, or cut between them on the turn.
- **Check the safe zones.** The crop that looked fine in landscape will put a face under the interface. See [vertical video safe zones](/blog/vertical-video-safe-zones).
- **Rebuild the audio.** Long-form dialogue sits low in the mix because the listener is committed. Shorts need the voice forward and the music under it, or the first second sounds thin: [fix bad audio in Shorts](/blog/fix-bad-audio-shorts).
- **Burn captions.** A repurposed clip is competing with native content; captions are table stakes, not an extra.
- **Re-export at the right settings.** A clip pulled from a compressed master and re-compressed twice will look soft: [export settings for vertical video](/blog/export-settings-vertical-video).

## A working weekly routine

The version that survives contact with a real schedule:

1. Record or publish the long video. Note the turn timestamps while it is fresh.
2. Same day, pick five candidates and name the shape of each.
3. Next day, cut all five in one sitting, with the same caption preset and the same export settings. Batching is what makes this affordable: [batch producing Shorts](/blog/batch-produce-shorts).
4. Schedule them across the following two weeks rather than posting all five in a day: [publishing and scheduling](/blog/publish-and-schedule-shorts).
5. After two weeks, check which shape held attention, and weight the next batch toward it.

The full podcast-specific version of this workflow, including how to handle two-speaker audio, is in [turning a podcast into Shorts](/blog/podcast-into-shorts). If you are choosing between repurposing and shooting native, the honest answer is that repurposed clips are cheaper and native clips perform better; the compromise is to shoot the first thirty seconds natively and repurpose the rest.
    `
  },
  {
    slug: 'viral-hooks-masterclass',
    title: 'The Viral Hooks Masterclass',
    description: 'Exactly what to say in the first 3 seconds of your video.',
    date: '2026-06-20',
    category: 'Strategy',
    content: `
# The Viral Hooks Masterclass

You have about three seconds before a viewer decides whether your video deserves the next thirty. That decision is not made by the quality of your edit, your lighting, or your punchline. It is made by whether the opening gives them a reason to stay. A hook is not a magic phrase you bolt onto the front of a finished video; it is a promise, made in the first frame, that the rest of the video has to keep.

This guide is about building that promise deliberately: the frames that work, the mechanics that make them land, how to write ten of them in twenty minutes, and how to tell whether the one you picked is actually doing its job.

## What a hook has to accomplish

A working opening does three things at once, usually in under eight words.

1. It establishes stakes. Something is at risk, wrong, expensive, or about to be missed.
2. It promises a specific payoff. The viewer should be able to describe, out loud, what they will know or see by the end.
3. It tells the truth about the video that follows. A hook that oversells is worse than a boring one, because the drop-off happens at second four instead of second one, and it teaches the platform that your video holds attention badly.

The third point is the one most creators skip. A hook is not a separate creative act from the video; it is a contract. If the opening says "three mistakes," the body should name three mistakes in the first fifteen seconds, not spend forty seconds on a story first.

## Four frames that keep working

Frames are reusable structures, not scripts. Each one works because it exploits a different reason people keep watching.

### 1. The mistake frame

You are doing something wrong and it is costing you. This works because it reframes the viewer as the subject of the video rather than an observer.

- Weak: "Here are three ways to grow on TikTok."
- Strong: "You are making these three mistakes on TikTok, and the third one caps your views."

The specificity in the second version is doing most of the work. "Three mistakes" is a promise you can keep in a thirty-second video; "ways to grow" is a promise that cannot be kept at all.

### 2. The insider frame

Knowledge that feels gated. It works because curiosity is stronger when the viewer believes other people already know the answer.

- Weak: "How to edit videos faster."
- Strong: "Editors charge four figures for this export setting. It takes ten seconds."

The risk here is overclaiming. If the setting turns out to be ordinary, the viewer feels cheated and the comment section says so.

### 3. The specific-number frame

Numbers make abstract promises concrete, and they make a video easy to evaluation: the viewer knows exactly how long the payoff will take.

- Weak: "Some tips for better captions."
- Strong: "Your captions are unreadable on a phone. Here is the one measurement that fixes it."

A number does not have to be large. It has to be checkable.

### 4. In medias res

Start mid-action, at the moment of highest tension, and explain afterwards. This is the only frame that works with no spoken words at all, which makes it the strongest option for sound-off feeds.

- Weak: opening on you sitting down to talk.
- Strong: opening on the half-second where the clip is already moving, then cutting back to how it got there.

## The three channels have to agree

A hook lands through three channels at once, and most weak openings have them fighting each other.

- The first frame: what is on screen before anything moves. A face mid-expression beats a face at rest; motion beats a static card; a frame that looks like an accident beats a frame that looks like a title slide.
- The on-screen text: the line a viewer can read without sound. It should not repeat the spoken line word for word, it should compress it.
- The first spoken line: the sentence that has to survive being heard at half attention, in a noisy room, at 1.2x speed.

When all three carry the same promise, the opening feels inevitable. When the text says "budget editing" and the spoken line says "let me tell you a story," the viewer's attention splits and the scroll wins.

## Writing ten hooks in twenty minutes

The fastest way to a good hook is to write a bad ten and pick the least bad one. Working alone, that beats waiting for inspiration.

1. Write the video's payoff as a single flat sentence, with no style: "the export bitrate that stops Shorts looking soft."
2. Write it as a mistake the viewer is making.
3. Write it as a number.
4. Write it as a warning.
5. Write it as the moment of payoff, with no setup.
6. Write it as a question the viewer has actually typed into search.
7. Write it addressed to one specific person: "if you film on a phone, this is for you."
8. Write it in the negative: "stop doing this before you export."
9. Write it with the cost attached: "this mistake costs you a re-upload."
10. Write the boring version, on purpose, so you have a baseline to compare against.

Then read all ten out loud, in the order you would actually say them. Two things usually happen: one reads naturally and three read like advertising. The natural one is your hook. If none of them read naturally, the problem is usually that the video's payoff is not specific enough yet, and no amount of wording will fix that.

## The failure modes

**Bait.** The hook promises something the video does not deliver. It buys three seconds and loses the next thirty, which is a worse trade than never being clicked at all.

**Borrowed hooks.** Copying a phrase that worked for someone else, with a different audience, in a different niche. The words transfer; the trust does not.

**Hook tuned to the wrong audience.** A hook that maximises curiosity from people who will never care about your subject pulls in traffic that does not convert, follow, or return. Short-term numbers go up, and the account gets harder to grow.

**Over-editing the opening.** Six cuts, three sound effects and a zoom in the first second tells the viewer you are compensating. One clear visual beat beats six busy ones.

**Assuming the hook is the problem.** Often it is not. If the first three seconds hold but the drop-off happens at second nine, the opening worked and the first section failed. That is a retention-graph problem, not a hook problem, and the fix is in the edit, not the copy.

## Measuring whether it worked

The number to watch is the share of impressions that survive to three seconds. Compare it against your own median, not against someone else's screenshot. A useful routine:

- Post the video, wait 48 hours, and record views at three seconds and views at the end.
- If three-second retention is above your median but completion is low, the hook is doing its job and the body is not.
- If three-second retention is below your median, the opening is the weak link; the body never got a chance.
- If both are high and views are low, the problem is distribution and the thumbnail or caption, not the video.

For a more careful version of this, including how to compare two hooks without splitting an audience you do not have yet, see [testing hooks with a small audience](/blog/test-hooks-with-small-audiences). For reading the shape of the drop-off itself, [how to read a retention graph](/blog/read-a-retention-graph) goes deeper.

## A worked rewrite

| Flat version | Hook |
| --- | --- |
| "Tips for better lighting" | "Your key light is on the wrong side. Here is how to tell in two seconds." |
| "How I edit my videos" | "I cut this 40-minute interview into nine Shorts in one sitting. Here is the order I do it in." |
| "Caption styles explained" | "This caption style is unreadable at arm's length. Most editors ship it anyway." |
| "Why your videos flopped" | "Your video did not flop. Your first frame did." |
| "My favourite tools" | "Three tools I pay for and one I would cancel tomorrow." |

Notice that every strong version commits to something the video can be checked against. That is the whole trick: specificity is what makes an opening feel like it is worth three seconds.

## The checklist

Before you export, read your opening and answer these honestly.

- Can a viewer say what they will get, in one sentence, after hearing only the first line?
- Does the first frame contain a face, motion, or an unfinished action?
- Does the on-screen text compress the spoken line instead of repeating it?
- Does the video deliver the promise inside the first fifteen seconds?
- Would the hook still make sense to someone who has never seen your other videos?
- Is there anything in the first second that is not doing work: a logo, a title card, a slow zoom?

If all six pass, post it. If not, fix the weakest one before you export, because the opening is the only part of the video every viewer is guaranteed to see.
    `
  },
  {
    slug: 'subtitle-styles',
    title: 'Subtitle Styles That Increase Watch Time',
    description: 'Not all captions are created equal. Choose the right style for your niche.',
    date: '2026-06-15',
    category: 'Design',
    content: `
# Subtitle Styles That Increase Watch Time

Captions are not decoration. On a phone, in a room with other people, with the sound off, they are the only reason a large share of your audience understands the video at all. That makes caption style a retention decision, not a taste decision: the wrong style forces the viewer to work, and a viewer who has to work scrolls.

This guide covers what captions are actually doing, the style families that exist, how to match one to your niche, and the readability limits that decide whether your captions help or hurt.

## What captions are doing for you

There are three jobs, and they pull in different directions.

**Comprehension.** The viewer hears the words and reads them at the same time, which makes accents, fast speech and noisy rooms survivable. This job wants plain, complete sentences.

**Attention.** Moving text gives the eye something to track, which keeps the viewer's gaze on the frame instead of drifting to the interface. This job wants motion and emphasis.

**Silent viewing.** Most feed browsing happens with sound off. Captions that make the video legible without audio convert that browsing into watch time. This job wants the text to carry the meaning on its own, which means it cannot be a verbatim transcript of filler words.

A style that serves one job and ruins another is a bad trade. Word-by-word animation serves attention and hurts comprehension when it outruns reading speed. A quiet minimal caption serves comprehension and loses the sound-off viewer who needs the emphasis.

## The three decisions

Every caption style is a combination of three choices, and it is easier to design a style by deciding each one than by browsing presets.

**Size.** Big enough to read at arm's length on a six-inch screen, small enough that four words do not fill the frame. In practice that is roughly a twentieth of the frame height per line, and never more than two lines at once.

**Position.** Centred and low is the default because it is where the eye already goes. It is also where every app puts its own interface. Keep captions out of the bottom fifth of the frame and away from the right edge, where the like and share buttons sit. The safe-area rules are the same ones that apply to every other element: [vertical video safe zones](/blog/vertical-video-safe-zones).

**Emphasis.** What changes to show the stressed word: colour, weight, scale, a box, or nothing. Emphasis is where a style gets its personality and where most styles get overwrought.

## The style families

### Bold word-by-word

Two or three words on screen at a time, heavy weight, high contrast, each chunk replacing the last. The default for talking-head and commentary content. It is loud, it reads instantly in sound-off, and it is unforgiving of long words, because a single long word on screen at large size eats the frame.

Best for: business, fitness, motivation, reaction, commentary. Weakest for: anything where the viewer needs to read a full sentence to follow an argument.

### Karaoke highlight

The whole sentence is on screen; each word lights up as it is spoken. This is the strongest option for educational content, because the viewer can read ahead, re-read a clause, and still see where the speaker is. It also survives being paused, which word-by-word does not.

Best for: tutorials, explainers, anything with numbers or steps. Weakest for: fast, punchy entertainment, where a full sentence on screen feels like homework.

### Minimal sentence block

One or two clean lines, small type, bottom centre, no animation. It stays out of the way and lets the footage carry the video. It is the only family that looks correct on cinematic footage, and the only one that does not date.

Best for: travel, vlogs, documentary, brand films. Weakest for: sound-off feeds, where it gives the eye nothing to do.

### Two-line broadcast

A consistent two-line block with a subtle background or shadow, swapped as a whole sentence changes. This is the caption style of television, and it works because the eye learns its rhythm immediately. It is the safest choice for interview and podcast clips, where the content is the draw and the text just has to keep up.

Best for: interviews, podcasts, panels. Weakest for: very short clips, where a two-line block never settles before the clip ends.

### Card

Text on a solid block or a coloured bar, often placed in the upper third. It reads as a title rather than a subtitle, which makes it useful for statements, quotes, and lists. Use it for one or two lines per video, not for every line of dialogue.

Best for: quote clips, list videos, hooks. Weakest for: continuous speech.

## Matching style to niche

| Content type | Style | Why |
| --- | --- | --- |
| Talking head, commentary | Bold word-by-word | Reads at a glance, holds the eye |
| Tutorial, explainer | Karaoke highlight | Allows reading ahead |
| Podcast or interview clip | Two-line broadcast | Rhythm the eye learns fast |
| Travel, vlog, brand | Minimal sentence block | Keeps footage dominant |
| Motivational, quote | Card or bold word-by-word | Emphasis is the point |
| Product demo | Karaoke highlight | Steps must stay visible |

If you are unsure, start with karaoke highlight. It is the most forgiving of the three jobs, and the least likely to make an ordinary video look cheap.

## The readability limits

These are the constraints that decide whether a caption style works, regardless of how it looks in the editor.

**Line length.** Around 32 to 38 characters per line at phone size. Beyond that the eye has to jump back to the start of the line, and it loses its place in the sentence.

**Hold time.** A line should stay long enough to read twice. If a viewer cannot finish it, they stop trying, and then they stop watching.

**Contrast.** White text on a bright sky is unreadable no matter how bold it is. Either add a shadow, a stroke, or a scrim, or move the text.

**Case.** All caps reads faster for two or three words and much slower for a full sentence. Use it for emphasis, not for paragraphs.

**Animation.** One movement per line is plenty. A pop, a slide, and a colour change on the same word is three things competing for the same half-second.

**Consistency.** The same position, weight and colour on every video. Viewers learn your caption rhythm within two or three clips, and a style that changes every post resets that learning.

## The mistakes that cost the most

- **Captions in the app's interface zone.** They get covered by the caption bubble, the username, or the progress bar.
- **White text on a white wall.** Common in indoor footage, invisible on a phone in daylight.
- **Transcript captions.** Filler words, false starts and repeated "ums" read as carelessness. Edit the transcript before you burn it in.
- **Emphasis on every word.** If everything is highlighted, nothing is.
- **One style for every video.** A heavy bold caption on a quiet travel film makes the footage look like b-roll.
- **Testing in the editor only.** The editor is a large screen at desk distance, which is the most forgiving place your video will ever be watched.

## A practical workflow

1. Pick the family from the content type, not from the aesthetic.
2. Set size and position once, using the safe-zone rules, and save it as your default.
3. Edit the transcript before styling it: remove filler, fix names, break long sentences.
4. Apply emphasis only to the words that carry the argument.
5. Watch the export on your phone, at arm's length, with the sound off, in daylight.
6. Keep the style for at least ten videos before changing it, so you have a baseline to judge against.

NexusCut ships these families as one-click presets in the [caption style generator](/tools/subtitle-style-generator) and the [animated subtitles](/tools/animated-subtitles) tool, and the readability rules above are covered in more depth in [caption readability](/blog/caption-readability-guide). If your captions are technically fine and retention is still flat, the issue is usually the pacing of the cut rather than the text: [how long should a YouTube Short be](/blog/how-long-should-a-youtube-short-be) is the next thing to check.
    `
  },
  // Two 90-word posts lived here: 'watch-time-optimization' and
  // 'retention-tricks'. They covered the retention graph and rewatch loops in
  // a couple of paragraphs, and the long-form guides in blogGuides2026.ts now
  // cover the same ground properly. Retired rather than left to compete with
  // their own replacements; both are 301-redirected in next.config.mjs.
// Generated posts below

  {
    slug: 'edit-vertical-videos-reels',
    title: 'How to Edit Vertical Videos for Reels',
    description: 'Learn a practical workflow for editing clear, platform-ready vertical videos for Reels.',
    date: '2026-07-22',
    category: 'Tutorial',
    content: `
# Editing Vertical Video for Reels, Shorts and TikTok

Vertical video is not horizontal video rotated. The frame change alters what fits, what reads, and what a viewer can absorb, and an edit that ignores that produces a clip that looks like a landscape video with the sides cut off.

This guide covers the frame itself: composition, cropping, text placement, motion, and the export details that decide whether the result looks professional or soft.

## The frame you are actually filling

A 9:16 canvas on a phone is roughly 1080 by 1920 pixels, viewed at arm's length. That has three consequences that shape every decision.

1. **Height is cheap, width is expensive.** You can stack elements vertically without crowding them; you cannot place two things side by side.
2. **Motion reads differently.** A horizontal pan crosses a narrow frame quickly and feels fast; a vertical tilt crosses a tall frame and feels slow.
3. **The edges are occupied.** The app's interface sits on the bottom and right. Anything important placed there is invisible.

Design for the middle: roughly the central 80% of the height and 85% of the width, with a deliberate margin.

## Composition in a narrow frame

The rules that matter, in order:

**One subject per frame.** Two people in a vertical frame means each is half the width of an already narrow space. Split them across shots instead.

**Headroom is expensive.** In landscape a generous headroom is elegant; in vertical it wastes the most valuable part of the frame. Frame tighter than feels natural, then check on a phone.

**Eyes in the upper third.** This is stable across every platform and every device, and it survives the interface overlays.

**Leading space, not centred.** A subject facing right should have room on the right. Centred subjects in vertical frames read as passport photos.

**Depth by overlap, not by width.** Since you cannot use the sides, put foreground objects at the bottom of the frame to create depth.

## Cropping landscape footage

Most vertical video starts as a 16:9 recording, and cropping is where it succeeds or fails.

- **Do not centre-crop a two-shot.** Choose one subject and follow them; cut to the other on the turn.
- **Pan the crop, do not jump it.** A moving crop window reads as camera movement; a jumping one reads as an error.
- **Respect the safe area inside the crop.** The area you can use is narrower than the frame.
- **Check faces at both ends of every pan.** A crop that clips a chin at the end of a move is the most common artefact in repurposed clips.
- **Accept a letterbox when the content demands it.** A wide shot of a landscape or a full pitch is sometimes better with bars than butchered by a crop.

## Text and interface

Text placement is where most vertical edits look amateur, and it is entirely mechanical to fix.

- **Bottom fifth is the app's.** Captions, usernames and progress bars live there.
- **Right edge is the buttons'.** Likes, comments, shares.
- **Top edge is partially the app's** on some placements.
- **Keep text inside the middle column**, and test with the interface visible, not on a clean preview.

The full margin numbers, platform by platform, are in [vertical video safe zones](/blog/vertical-video-safe-zones).

## Motion and transitions

Vertical frames make motion feel faster than it is, which means restraint pays.

- **One transition type per clip.** A cut is the default and usually the best.
- **Avoid horizontal wipes.** They work against a tall frame.
- **Use vertical motion deliberately.** A tilt down a person, a drop into a reveal: vertical moves feel natural here.
- **Keep zooms slow.** A fast punch-in on a tall frame feels violent.
- **Do not animate the crop.** Stabilise first, then crop.

## Audio for a phone speaker

Vertical video is usually watched on a phone speaker, in a room, at low volume.

- **Voice forward, music under.** A mix that sounds balanced on headphones is often music-heavy on a speaker.
- **Check intelligibility at half volume**, not at comfortable levels.
- **Avoid sub-bass.** Phone speakers cannot reproduce it, and it eats headroom that the voice needs.
- **Watch the loudness target.** Platforms normalise; a mix that is too quiet gets turned up along with its noise floor.

[Fixing bad audio in Shorts](/blog/fix-bad-audio-shorts) covers the processing order.

## Export settings that decide quality

Three numbers matter, and platforms re-compress everything you upload, so the goal is to arrive with more detail than they will keep.

- **Resolution:** 1080 by 1920. Uploading 4K vertical is fine, but it is re-encoded down; what matters is that the source is not upscaled from something smaller.
- **Frame rate:** match the source. 30fps for talking heads, 60fps for motion, and do not convert unless you must.
- **Bitrate:** high. This is the number that separates a crisp export from a mushy one, especially with fast motion and fine text.

The full breakdown, including why burned-in captions are the first thing to show compression, is in [export settings for vertical video](/blog/export-settings-vertical-video).

## The phone check

Before publishing, watch the export on the actual device, in the actual app, with the interface visible.

- Full brightness, then half brightness.
- Sound off, then half volume.
- At arm's length, not held close.

Most vertical edits that fail, fail this check and pass every other one. The editor is a large, forgiving screen; the phone is the only place the video will actually be seen.

## A workflow that keeps the frame consistent

1. Set the canvas to 1080 by 1920 before importing anything, so every decision is made in the final frame.
2. Build a template: caption preset, text position, intro shot, outro line.
3. Import footage, then fix the crop shot by shot.
4. Captions last, after the cut is locked, so timing does not drift.
5. Export, then run the phone check.
6. Reuse the template for the next ten videos before changing it.

Consistency is what makes a channel readable at a glance, and in a vertical feed, being recognisable in the first frame is worth more than any individual edit. For the batch-production side, see [batch producing Shorts](/blog/batch-produce-shorts).
    `
  },

  {
    slug: 'edit-sports-highlights',
    title: 'How to Edit Sports Highlights for TikTok',
    description: 'Learn the secrets to mastering how to edit sports highlights for tiktok and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Niche',
    content: `
# Editing Sports Highlights for Short-Form Feeds

Sports clips have an advantage almost no other niche has: the moment of payoff is unambiguous. A goal, a dunk, a save, a knockout. The viewer knows within half a second whether they are watching something worth their time. That should make sports the easiest content on the platform to edit, and it is usually the hardest, because everything around the moment either builds the tension or wastes it.

This guide is about building the ninety seconds around the three seconds that matter.

## Start from the moment, backwards

Do not start by watching the game. Start by listing the moments. One line each, with a timestamp: who, what, how surprising. Then rank them by how much explanation each one needs.

A dunk needs no explanation. A tactical foul in the eighty-eighth minute needs three seconds of context or it reads as nothing. The ranking tells you the structure of the clip before you touch the timeline:

- **Self-explanatory moments** go at the start. They buy you attention immediately.
- **Moments that need context** go after, once the viewer has a reason to stay for a setup.
- **Near-misses** are the most underrated. A shot that hits the post creates more tension than the goal that follows it, and it costs you three seconds.

## The build is the edit

Sports clips fail in the two seconds before the moment, not during it. Three techniques do almost all the work.

**Trim the run-up, keep the approach.** A player's run from halfway is dead time; the last four steps are the clip. Cut to the approach mid-stride, so the viewer's eye arrives already in motion.

**Hold on the aftermath.** The reaction, the crowd, the bench. One and a half seconds of a teammate's face does more for a highlight than a slow-motion replay, and it is the part beginners cut first.

**Use the ambient sound.** A goal with the crowd muted is a training video. Keep the roar under the commentary, and duck it rather than deleting it.

## Slow motion, used once

Slow motion is powerful exactly once per clip. The second use halves the impact of the first. The usual correct placement is on the contact or the release: the boot on the ball, the hand on the rim, the moment of impact. Before and after should play at real speed, because real speed is what makes slow motion read as emphasis.

Two practical notes:

- Shoot at least 60fps if you plan to slow anything down. Slowing 30fps footage gives you stutter that no interpolation fixes convincingly.
- Do not slow the celebration. It makes the clip feel like a montage rather than a highlight.

## Framing the crop

Broadcast footage is framed for a wide screen, and the subject is often a fifth of the frame. Recropping to vertical is the single biggest quality difference between a professional sports edit and an amateur one.

- **Follow the ball, cut on the change of possession.** A static crop that centres the pitch shows nothing.
- **Frame for the next action, not the current one.** If the ball is about to be crossed, the crop should be ahead of the player, not on them.
- **Accept the wide shot when the moment is spatial.** A full-pitch view of a counter-attack is worth more than a tight crop of one runner. Vertical does not require a close-up; it requires the subject to be legible.
- **Leave room for captions.** Text in the bottom fifth will collide with the platform's interface: [vertical video safe zones](/blog/vertical-video-safe-zones).

## Captions and scoreline

Two pieces of text carry almost all the information in a sports clip, and they should be treated as graphics rather than subtitles.

**The scoreline.** Small, constant, top or bottom corner, updated at the moment it changes. It answers the viewer's first question without them having to ask it.

**The name.** Player name and team, on the moment they become the subject. Not at the start of the clip, when the viewer does not yet know who matters.

For spoken commentary, keep captions short and never let them cover the action. A caption over the ball is a caption nobody reads.

## Music versus commentary

There are two legitimate versions of a sports clip and they want opposite edits.

**Commentary-led** keeps the crowd and the broadcaster. The music is a bed at low volume, side-chained under the voice so it dips whenever anyone speaks. This is the version that works for analysis, retrospectives, and anything with a story.

**Music-led** drops the commentary and cuts to the beat. This is the version that works for montages and for clips where the visual is self-explanatory. The risk is that beat-matched cuts flatten the natural rhythm of the sport; a goal does not care where the snare is.

Pick one. A clip that alternates between the two reads as indecision.

## Rights, briefly and honestly

This matters more in sports than anywhere else, and it is worth being straight about it: broadcast footage, league footage, and music are all owned by someone. Short clips with commentary and transformation are widely tolerated and sometimes licensed; wholesale re-uploads are not, and they get accounts struck. If you are building a channel rather than posting one clip, the sustainable path is your own footage, licensed footage, or a clear commentary format. Do not build a business on the assumption that a rights holder will not notice.

## The export pass

Sports footage is high-motion, which is the worst case for compression. Fast pans and crowd detail turn to mush at low bitrate.

- Export at the highest bitrate the platform accepts rather than the default.
- Check a fast pan frame by frame after export, not just the still frames.
- Keep the source at the original frame rate; converting 60fps to 30fps loses the smoothness that makes slow motion work.
- Set the export settings once and reuse them: [export settings for vertical video](/blog/export-settings-vertical-video).

## A repeatable structure

The format that holds up across sports and across platforms:

1. **Cold open on the moment** (1 to 2 seconds, no context).
2. **Cut back to the approach** (2 to 3 seconds).
3. **The moment at real speed**, with ambient sound up.
4. **One slow-motion replay** of the contact.
5. **The reaction** (crowd, bench, opponent).
6. **Scoreline update or a single closing line of text.**

Six beats, under twenty seconds, and it works for football, basketball, hockey, combat sports and athletics with almost no changes. The variation is in which beat you open on: for a comeback, open on the final score and work backwards; for a single play, open on the contact.

If you are producing these weekly, batch them: cut five clips in one sitting with the same caption preset and the same export settings, then publish across the week rather than all at once: [batch producing Shorts](/blog/batch-produce-shorts).
    `
  },
  {
    slug: 'edit-tutorial-clips',
    title: 'How to Edit Tutorial Clips',
    description: 'Learn the secrets to mastering how to edit tutorial clips and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Tutorial',
    content: `
# Editing Tutorial Clips That People Can Actually Follow

A tutorial fails for one of two reasons: the viewer cannot see what you are doing, or the viewer cannot tell why it matters. Both are editing problems, and both are fixable before you record.

Short-form tutorials are a strange format. You have under sixty seconds to teach something that normally takes five minutes, and the audience is watching on a phone, often with the sound off, often while doing something else. That constraint shapes every decision.

## Decide the one thing

The most common tutorial mistake is teaching two things. A clip that covers "how to crop" and "how to export" teaches neither, because the viewer's attention splits at the transition and never comes back.

Write the outcome as a single sentence the viewer could repeat afterwards: "you will know the setting that stops Shorts looking soft." If your sentence needs an "and", cut one of the halves and save it for another clip.

## Show, then explain

The order matters more than the production value.

1. **Show the result first.** One second of the finished thing. This answers "is this worth my time" before the viewer has committed.
2. **Show the starting state.** What their screen looks like now.
3. **Do the thing, once, at real speed.** No fast-forward, no montage. If it takes twenty seconds, the clip takes twenty seconds.
4. **Point at the change.** The one thing that changed on screen, circled, zoomed, or stated in text.
5. **Show the result again.** Same shot as step one, so the viewer can compare.

That structure is why "before and after" tutorials outperform explainers: the viewer gets the payoff twice.

## Recording that is readable on a phone

Screen recordings are the weakest link in most tutorials, because they are captured at desktop resolution and then shrunk to a phone.

- **Record at the resolution you will show, not the resolution you work at.** A 4K screen recording of a full interface is unreadable at phone size.
- **Zoom into the region that matters.** One panel, not the whole application.
- **Increase the interface scale** before recording. Text that is comfortable at desk distance is invisible on a phone.
- **Move the cursor slowly and deliberately.** A cursor that jumps between menus loses the viewer instantly.
- **Pause before you click.** Half a second of stillness before each action is the difference between following and guessing.

If you are filming a physical process instead, the rules invert: light the work surface, keep the camera on a tripod, and shoot the hands from the same angle every time so the viewer's mental model stays stable.

## Pacing for instruction

Instruction has a different rhythm from entertainment. Entertainment cuts fast; instruction needs holds.

- **Hold each screen long enough to read it twice.** If the viewer is reading, they are not watching, and if they cannot finish reading they give up.
- **Cut silence, keep pauses.** Dead air between sentences goes; the pause before a reveal stays.
- **Repeat the key action once.** Not the whole step, just the action: one replay of the click is worth thirty seconds of explanation.
- **Never cut mid-action.** A cut in the middle of a drag reads as an error, and the viewer assumes they missed a step.

A useful test: watch your own clip at 1.5x. If it becomes incomprehensible, it is already too fast for a first-time viewer.

## Text that carries the steps

In a tutorial, on-screen text is not decoration; it is the structure. The viewer who has the sound off should be able to follow the whole clip from the text alone.

- **Number the steps.** Even if you never say the numbers out loud.
- **One instruction per text block.** Two instructions on screen at once means the viewer reads the second and misses the first.
- **Keep the text in the same place.** Moving text forces the eye to search.
- **State the value, not the label.** "Set export bitrate to 12 Mbps" beats "check your export settings."
- **Put URLs and file names in the description**, not on screen; nobody can type from a moving caption.

For the typography side, the same readability limits apply as for any caption: [caption readability](/blog/caption-readability-guide).

## The audio decision

Tutorials are the one format where a clear voice matters more than music. Two options that work:

**Voice-led**, with no music at all. The most watchable option for anything with numbers or settings, because music competes with comprehension. Add a quiet bed only if the room tone is bad.

**Voice with a low bed**, ducked hard under speech. Works for motivational or list-style tutorials where energy matters.

What does not work: music only, with text instructions. It reads as a slideshow, and it gives the viewer no reason to trust that you know what you are doing.

## The description does half the work

For search-driven tutorial content, the description is part of the edit, not an afterthought.

- State the outcome in the first sentence, in the words a person would search.
- List the steps as text, so the clip is skimmable without watching.
- Link the tool or the file you used.
- Put the exact settings values in writing; they are the thing people come back for.

## A format that scales

Once you have one tutorial that works, the format is repeatable:

1. Result (1s)
2. Starting state (2s)
3. Step one (5-10s, real speed)
4. Step two (5-10s)
5. The change, pointed at (2s)
6. Result again (2s)
7. One line of text: what to remember

Seven beats, forty seconds, and it works for software, cooking, repair, fitness form, and anything else with a visible before and after. The variation is in step three and four: some processes need three steps, some need one. What must not change is the result appearing at both ends, because that is what makes the clip feel complete rather than truncated.

If you produce tutorials regularly, record the raw footage in batches and cut them across a week: the setup cost is in the recording, not the editing. [Batch producing Shorts](/blog/batch-produce-shorts) covers the scheduling side.
    `
  },

  {
    slug: 'edit-reaction-videos',
    title: 'How to Edit Reaction Videos',
    description: 'Learn the secrets to mastering how to edit reaction videos and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Niche',
    content: `
# Editing Reaction Videos So the Reaction Is the Content

A reaction video has one asset: a face changing. Everything else in the frame is support. Most reaction edits fail because they spend their time on the thing being reacted to and put the face in a corner.

The format works because it is social. The viewer is watching someone else watch something, which is a way of watching it with company. That means the edit has to preserve the sequence of the reaction, not just the reaction itself.

## The structure that works

Three parts, and the proportions matter more than the content.

1. **The setup** (2 to 4 seconds). Enough of the source clip that the viewer knows what is about to happen. Not the whole thing.
2. **The reaction** (60 to 70 percent of the runtime). The face, in real time, including the parts where nothing happens.
3. **The payoff** (5 to 10 seconds). The moment the reaction peaks, held, then a line that lands it.

The mistake is inverting the proportions: forty seconds of source footage with a small face in the corner is a repost with commentary, and it performs like one.

## Framing two things at once

Vertical framing makes this harder than it looks, because you have one narrow column and two subjects.

- **Split screen, face on top.** The most legible layout for phone viewing, because the face is at eye level and the source is below. Keep the split at roughly 40/60.
- **Face full frame, source inset.** Better when the reaction is the point and the source is context. The inset should be large enough to read expressions and small enough not to compete.
- **Cut between them.** The most cinematic option and the most work: hold on the face, cut to the source at the moment of the reveal, cut back to the face for the aftermath.

Whichever you choose, keep the layout identical for the whole clip. A layout that changes mid-video resets the viewer's attention.

## The cut points are the joke

Reaction editing is mostly about where you cut, not what effects you add.

- **Cut before the peak, not after.** If the reaction is a laugh, cut to the face half a second before it starts, so the viewer sees it arrive.
- **Hold through the pause.** The pause before a reaction is the tension. Cutting it out to keep pace kills the format.
- **Cut back for the double take.** A second look at the face after the source continues is the cheapest reliable laugh in the format.
- **Do not cut on every beat of the source.** The source clip's rhythm is not your clip's rhythm; the reaction sets it.

## Sound is the whole trick

Reaction audio is two sources in one track, and getting the balance wrong ruins both.

- **Mic the reactor, not the room.** The reaction needs to be close and dry; the source clip can be thin and distant, because that is how it would sound in the room.
- **Duck the source when the reactor speaks.** A side-chain or a manual dip, either way: the voice has to win.
- **Keep the source audible.** Muting it entirely removes the reason the face is reacting, and the viewer loses the context that makes the reaction meaningful.
- **Watch for the headphone bleed.** Reactors wearing headphones often have the source leaking into the mic, which makes the whole clip sound like it was recorded in a bathroom.

## Authenticity and the appearance of it

The format's currency is that the reaction is real. That has practical editing consequences: over-cutting, added sound effects, and zoom punches on every beat all read as manufactured, and manufactured reactions do not travel.

The edits that help authenticity: fewer cuts, longer holds, a visible pause, and no music under the reaction itself unless the reactor is genuinely reacting to music.

There is also an honest limits note worth stating: reacting to someone else's video uses their footage. Short reactions with visible commentary are widely tolerated and often licensed; long unedited stretches with a face in the corner are not, and they are the ones that get struck. Keep source clips short, keep your commentary load-bearing, and do not build a channel that only works if nobody enforces copyright.

## Batching reactions

Reaction content scales unusually well because the recording is cheap: one camera, one mic, one sitting.

1. Pick five source clips the day before and watch them cold on camera, one take each. The first take is the reaction; the second is a performance.
2. Cut each one the same day, while you remember which moment surprised you.
3. Keep one caption preset and one layout for the whole batch: [caption readability](/blog/caption-readability-guide).
4. Publish across the week rather than in one day: [publishing and scheduling](/blog/publish-and-schedule-shorts).

The format also benefits from a consistent opening frame, because viewers recognise the layout before they read the title. That consistency is worth more than any individual edit.

## When the format stops working

Three signals that a reaction channel needs a change of shape:

- **The reaction is the same every time.** If your face does the same thing for every source, the viewer has seen it and will not return.
- **You are reacting to things nobody knows.** The format depends on shared context; niche sources shrink the audience.
- **The comments are about the source, not about you.** That means you are a distribution channel for someone else's work, and you have no moat.

The fix in all three cases is the same: bring something the source does not have. Expertise, a contrary take, a demonstration, a story the source reminds you of. The face is the format; the reason to watch has to be something else.
    `
  },
  {
    slug: 'edit-motivational-clips',
    title: 'How to Edit Motivational Clips',
    description: 'Learn the secrets to mastering how to edit motivational clips and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Niche',
    content: `
# Editing Motivational Clips Without Making Them Feel Like Advertisements

Motivational content has the highest ratio of supply to demand on every short-form platform. It is also the easiest to make badly, because the format's tools are loud: big text, swelling music, slow motion, a hard cut to black. Used together, they produce something that reads as an advert for a course nobody is selling.

The clips that work are quieter and more specific. This guide is about the difference.

## One sentence, one turn

A motivational clip is an argument in miniature. It needs a claim and a turn: the thing you believed, and the thing that changed.

Weak: "Never give up."
Strong: "I quit at month eight. Month nine is when it would have worked."

The second version has a fact in it, and facts are what separate a motivational clip from a poster. If you cannot find the fact, you do not have a clip yet; you have a slogan.

## The build

Structure is where motivation lives, not adjectives.

1. **The stake** (3 seconds). What was at risk, stated concretely.
2. **The low point** (5 to 8 seconds). Specific, not abstract. A number, a date, a thing that happened.
3. **The turn** (3 seconds). What changed, and why.
4. **The consequence** (5 seconds). What is true now that was not before.
5. **The close** (3 seconds). One line the viewer can take with them. Not a command.

Five beats, twenty-five seconds. The proportion that matters is the low point being longer than the triumph, because the low point is what the viewer recognises.

## Pacing and silence

The instinct in motivational editing is to fill every second with music and motion. That instinct is wrong. Silence is the most powerful tool in the format and the least used.

- **Cut the music for one beat before the turn.** Half a second of nothing makes the next line land.
- **Hold on the face, not on the b-roll.** A still shot with a real expression beats a drone shot every time.
- **Let the last line sit.** Two seconds of black with the text still on screen is a better ending than a hard cut to a logo.
- **Do not cut to the beat of the music.** Cut to the beat of the sentence.

## Text that earns its size

Big text is the signature of the genre and the reason most of it is unreadable.

- **One line on screen at a time.** Motivational clips with three lines of text are reading exercises.
- **Use size for hierarchy, not for volume.** The emphasised word gets bigger; the rest stays legible.
- **Keep the text off the face.** Especially the eyes.
- **Match case to length.** All caps for three words, sentence case for a full line.
- **No text on the emotional beat.** The moment the viewer should feel something is the moment to remove the words.

The typographic limits are the same as anywhere else: [caption readability](/blog/caption-readability-guide).

## Music, honestly

Music does most of the emotional work in this genre, which makes the licensing question unavoidable.

- **Licensed or royalty-free only.** Motivational edits using commercial tracks get muted, and a muted clip loses the thing that made it work.
- **Build the edit to the track's structure**, not to a generic swell. Find the lift, and place the turn there.
- **Duck the music under speech**, even when the speech is only one line.
- **Avoid the most overused tracks.** If a track is on ten thousand clips, it now signals "generic motivation" to the viewer before the content arrives.

## Slow motion and b-roll

Both are support, not content.

- **Slow motion on a gesture, not on a landscape.** A hand, a turn of the head, an exhausted sit-down.
- **Shoot your own b-roll if you can.** Stock footage of a sunrise is the fastest way to look like every other account in the niche.
- **Keep b-roll short.** Two seconds, then back to the face or the fact.
- **Match the grade.** Mixing warm stock with a cool-tinted selfie shot reads as assembled rather than made.

## The honesty test

The genre's reputational problem is that much of it is advice from people who have not done the thing. The editorial fix is simple and it works: every claim in the clip should be something you can point at.

- A number you actually hit.
- A failure you actually had.
- A date you can name.
- A decision you can describe.

That is also the practical difference between a clip that gets saved and a clip that gets scrolled: specificity is memorable, and abstraction is not.

## The repetitive-output problem

Motivational accounts tend to converge on one clip, repeated with different b-roll. That produces a channel that performs once, then plateaus, because the platform learns the content is duplicative and the audience learns they have seen it.

Two things keep it fresh without inventing a new format every week:

- **Vary the source of the fact.** Different periods of your life, different projects, different mistakes.
- **Vary the beat structure.** Some clips open on the consequence and work backwards; some open mid-story.

If you want to check whether the variation is working, the method is the same as any other niche: [reading a retention graph](/blog/read-a-retention-graph) shows you which beat the audience leaves on, and [vanity metrics versus real signals](/blog/vanity-metrics-vs-real-signals) tells you which numbers to ignore.
    `
  },
  {
    slug: 'edit-comedy-clips',
    title: 'How to Edit Comedy Clips',
    description: 'Learn the secrets to mastering how to edit comedy clips and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Niche',
    content: `
# Editing Comedy Clips: Timing, Holds and the Cut That Kills the Joke

Comedy is the one genre where the edit is the joke. The same footage, cut 0.4 seconds differently, is either funny or dead, and no effect, sound effect or caption can rescue a joke whose timing was thrown away in the timeline.

That makes comedy editing a discipline of restraint. Most of the work is deciding what not to touch.

## The three timing rules

**Rule one: the cut before the line.** The setup line ends, and there is a beat of nothing before the punchline. That beat is where the audience anticipates, and anticipation is most of comedy. Cutting it out to "keep pace" removes the mechanism.

**Rule two: hold the reaction.** After the punchline, stay on the face for at least a full second, ideally two. The laugh, the wince, the realisation. Cutting immediately after the line is the single most common comedy editing error, because the editor is afraid of silence and the audience needs it.

**Rule three: never cut mid-laugh.** A cut in the middle of a laugh reads as a mistake and takes the viewer out of the moment. If you need to trim, trim after the laugh has settled.

Those three rules account for most of the difference between a clip that travels and one that does not.

## Setup and payoff on a phone

Vertical framing compresses the joke. A wide shot that shows two people and a third thing happening has no equivalent in a 9:16 frame, and trying to preserve it produces a postage stamp.

- **Cut to the person who is not talking.** Comedy lives in the reaction shot, and in vertical you get one shot at a time, which makes the reaction cut more important, not less.
- **Use the crop as a reveal.** A held wide shot that suddenly crops to a face is a visual punchline; it works because the audience was not looking there.
- **Keep the important object in frame.** If the joke depends on something in the corner of a wide shot, shoot a pickup or the joke does not survive the crop.

## Sound: the invisible half

Comedy audio has two jobs: make the line intelligible, and make the silence audible.

- **Remove room tone from pauses? No.** The opposite: keep a low bed of room tone under the pause so it feels intentional rather than dropped. A hard cut to digital silence sounds like a technical fault.
- **Do not add a laugh track, and do not add a "comedy" sound effect.** Both tell the audience where the joke is, which is the one thing they must work out themselves.
- **Keep the breath before the line.** It is part of the delivery.
- **Watch the music.** A bed at any audible level competes with the timing. If you must have music, drop it out entirely for the punchline.

## Text and captions

Comedy captions are a trap: they let the viewer read the joke before they hear it, which removes the surprise.

- **Caption the setup, not the punchline.** Or delay the punchline's caption by half a second so the ear wins.
- **Never caption a visual gag.** Explaining it is the death of it.
- **Keep the caption off the face during the reaction.** The reaction is the payoff; text over it splits attention.

Readability limits still apply, they just matter less than timing here: [caption readability](/blog/caption-readability-guide).

## Dead air, and how much to keep

Short-form comedy has an unusual tolerance for stillness. A two-second hold on a blank face is funny; a two-second hold on a talking head explaining context is not.

The distinction is whether something is happening. A hold where the audience is watching a person compute is content. A hold where nothing is being computed is dead air.

Rule of thumb: cut the explanation, keep the computation.

## Sketch versus clip

Two different structures, and they need different edits.

**The clip** (under thirty seconds): one setup, one turn, one reaction. Nothing else. The edit should be invisible; any cut that draws attention to itself is competing with the joke.

**The sketch** (sixty to ninety seconds): a premise, escalation, and a button. Escalation needs rhythm, which means the cuts get shorter as the sketch builds, and the button needs the longest hold in the whole piece.

Most failed sketches are clips that kept escalating without a button, or sketches published as clips with the escalation removed.

## What to do when it is not funny

If the footage is not landing, the fix is almost never an effect. Four things to check, in order:

1. **Is the setup too long?** Cut the first third of it and see whether the joke survives. It usually does.
2. **Is the pause there?** Add 300 milliseconds before the punchline.
3. **Is the reaction held?** Extend the shot after the line by a full second.
4. **Is the joke explained anywhere?** Any line that explains the premise is a line to delete.

If it still does not work after those four, the joke is not there, and no edit will find it. That is worth knowing early rather than after an hour of adding sound effects.

## Publishing comedy

Two practical notes that matter more than they seem:

- **The first frame has to be funny or intriguing, not the first line.** Sound-off viewers decide before the audio starts.
- **Do not front-load the premise in the caption or title.** A title that explains the joke removes the reason to watch.

For the measurement side, comedy clips show a distinctive retention shape: a spike at the punchline, then a drop. If the drop comes before the punchline, the setup is too long. If there is no spike at all, the punchline is not landing. [Reading a retention graph](/blog/read-a-retention-graph) explains how to see that in the data rather than guessing.
    `
  },
  {
    slug: 'edit-business-clips',
    title: 'How to Edit Business Clips',
    description: 'Learn the secrets to mastering how to edit business clips and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Niche',
    content: `
# Editing Business Clips That Do Not Look Like Advertisements

Business video has a credibility problem, and it is entirely a production problem. The content is often genuinely useful and the edit makes it look like a stock advertisement: royalty-free music, a drone shot, a smiling team, and a voiceover saying "solutions."

The clips that work for a business look like a person explaining something they know. That is a lower bar than most marketing teams assume, and a much higher bar than most corporate video clears.

## Decide which of three jobs the clip is doing

Business clips fail when they try to do all three at once.

**Recruiting.** The viewer's question is "would I like working here." Answer it with real people, real workspace, real problems. A polished office tour answers nothing.

**Explaining the product.** The viewer's question is "what does it do and what does it cost me." Answer it with a screen, a use case, and a number.

**Establishing expertise.** The viewer's question is "do these people know something I do not." Answer it with a specific claim and evidence.

A thirty-second clip can do one of those. Pick one, and let the description do the others.

## The structure that reads as credible

1. **Open with the specific problem**, in the customer's words, not the company's. "Our invoices take eleven days to clear" beats "streamline your financial operations."
2. **Show the mechanism.** A screen, a process, a person doing the thing. Not a metaphor.
3. **State the result with a number**, and be honest about the conditions.
4. **Close with an ask that is not "buy now."** A demo, a template, a checklist. Something the viewer can take.

That last point is what separates business content that builds an audience from business content that gets skipped: give something before asking for something.

## Filming people who are not comfortable on camera

Most business clips involve someone who does not want to be filmed, and it shows.

- **Interview, do not script.** Ask a question and let them answer in their own words. Scripted corporate delivery is the single strongest "this is an advert" signal.
- **Shoot at their desk, not in a conference room.** Context is credibility.
- **Accept the imperfect take.** The answer with a stumble and a real sentence beats the polished one with no content.
- **Get two angles.** A wide and a close-up of hands or a screen gives the edit something to cut to when the delivery drags.

## Screen recordings without looking cheap

Product clips live or die on the screen capture.

- **Record at the scale you will show.** Zoom to the panel that matters; do not show the whole application.
- **Slow the cursor down.** Fast mouse movement is unreadable on a phone.
- **Pause before each click** so the viewer can predict it.
- **Blur or remove customer data.** This is not optional, and it is the most common compliance failure in business content.
- **Add one callout per step**, not five.

## The brand kit problem

Every business has brand colours, a logo, a font and a lower-third template, and the temptation is to use all of them in every clip. Restraint reads as confidence.

- **One brand element per clip.** A colour accent, or a logo card at the end, not both plus a lower third plus a watermark.
- **Keep the logo out of the opening frame.** It delays the content and signals an advertisement.
- **Use the brand font for text, not for captions.** Caption legibility beats brand consistency every time.

## Music and voice

The default royalty-free corporate track is a liability: it is the sound of an advertisement. Three options that work better:

- **No music, clean voice.** The most credible option, and the cheapest.
- **A quiet ambient bed** under speech, ducked hard.
- **Room tone only**, with sound effects for transitions.

If the clip has no voice at all (a product demo with text), then music is carrying the pacing, and it needs to be chosen for rhythm rather than for "professional feel."

## What to measure

Business content is usually judged on the wrong metric. Views are cheap; the number that matters is whether the viewer takes the next step.

- **Watch for saves and shares**, which indicate usefulness rather than entertainment.
- **Track the click to the landing page or demo request**, and compare it against the platform's own reporting.
- **Ignore follower growth as a primary metric** for business accounts; a smaller, relevant audience outperforms a large, indifferent one: [vanity metrics versus real signals](/blog/vanity-metrics-vs-real-signals).

## A format that scales for a small team

The version that survives a busy week:

1. Record one twenty-minute conversation with someone who knows the subject, once a month.
2. Pull five thirty-second answers from it, each doing one of the three jobs above.
3. Cut them with the same caption preset and the same export settings in a single sitting: [batch producing Shorts](/blog/batch-produce-shorts).
4. Publish across the month, one per week.
5. Each month, keep the format that got the most saves, and drop the rest.

That is one recording day per month for twenty clips, and it produces content that sounds like a company that knows what it is talking about, because it is one.
    `
  },
  {
    slug: 'edit-educational-shorts',
    title: 'How to Edit Educational Shorts',
    description: 'Learn the secrets to mastering how to edit educational shorts and skyrocketing your views.',
    date: '2026-07-22',
    category: 'Niche',
    content: `
# Editing Educational Shorts So the Lesson Survives the Format

Teaching in under sixty seconds is a compression problem. You are not summarising a lesson; you are choosing the one thing that will still be true for the viewer tomorrow, and building a clip around it.

Done well, educational shorts are the most durable content on the platform: they get saved, re-watched, and found in search months later. Done badly, they are thirty seconds of a person saying "so basically" before the point.

## The one-takeaway rule

Write the takeaway first, as a sentence a viewer could repeat to a friend. If you cannot write it in one sentence, you have two lessons and one clip too few.

Good takeaways are checkable:

- "A 12 Mbps export stops Shorts looking soft."
- "Read the retention graph at the five-second mark, not the average."
- "Cap lines at 38 characters or the eye loses its place."

Bad takeaways are not:

- "Export settings matter."
- "Understand your analytics."
- "Captions are important."

The test is whether the sentence contains something a viewer could do differently in the next ten minutes.

## Structure: claim, mechanism, evidence

Three beats, in that order, and the proportions are roughly 15/60/25.

**Claim.** State the takeaway immediately. No preamble, no "in this video we will look at." The claim is the hook.

**Mechanism.** Why it is true. This is the part that earns trust and the part that gets cut by accident when the clip runs long. If you have to lose a beat, lose the evidence, never the mechanism.

**Evidence.** A demonstration, a number, a before-and-after. One is enough.

A fourth beat, optional and powerful: **the boundary**. When does the rule not apply? "This works for talking heads; for fast action, use a higher bitrate." Boundaries are what make an educational clip feel like it came from someone who has actually done the thing.

## Explaining without visual aids

The most common failure in educational shorts is a talking head explaining something spatial, numerical, or procedural with no visual support. The viewer cannot follow, and the clip's retention collapses in the middle.

- **If it has a number, show the number.** On screen, large, and hold it.
- **If it has steps, number them on screen** even if you also say them.
- **If it has a comparison, show both at once.** Sequential comparison requires memory; simultaneous comparison does not.
- **If it is abstract, use one concrete example instead of a diagram.**

That last one is the highest-leverage rule in the genre: one specific example teaches more than a general explanation, and it fits the format.

## Pacing: the opposite of entertainment

Educational content needs holds. The instinct to cut every two seconds, learned from entertainment editing, destroys comprehension because the viewer is processing what you said while you cut to the next thing.

- **Hold each screen for two reads.** Adjust for line length, not for a stopwatch.
- **Cut the setup, hold the explanation.** The opposite of what pacing instinct suggests.
- **Pause after the claim.** Half a second lets the viewer register that this is the thing to remember.
- **Do not accelerate the ending.** Educational clips that rush the last ten seconds leave the viewer with nothing.

A useful test: mute the clip and try to follow it from the text alone. If you cannot, the text is not doing its job.

## Captions as the second teacher

In educational content, captions are not access features; they are the primary text. A large share of the audience will read rather than listen.

- **Put the key term in the caption, not just the narration.**
- **Break lines at the clause boundary**, not at a fixed character count, so the meaning survives the break.
- **Emphasise the takeaway word**, once.
- **Keep the caption clear of the demonstration.** Text over the thing being demonstrated is worse than no text.

The typography rules are the same everywhere: [caption readability](/blog/caption-readability-guide).

## Accuracy and sourcing

Educational content carries a specific risk: being confidently wrong is worse than being vague, because the clip gets saved and repeated.

- **State the conditions with the claim.** "At 1080p, on TikTok" is part of the claim, not a caveat.
- **Say when something is your experience** rather than a general rule.
- **Link the source** in the description when there is one.
- **Correct errors visibly** rather than quietly deleting; a correction clip is often better content than the original.

## Making a series

Educational content is the easiest genre to build a series from, and series get watched in sequence, which is the cheapest retention you will ever get.

- **Keep the format identical:** same opening structure, same caption preset, same length.
- **Number the series** so a viewer knows there is more.
- **End each clip with the next question**, not a call to action. "The next thing to check is why it still looks soft after that" is a better close than "follow for more."

For the analytics side of a series, [reading a retention graph](/blog/read-a-retention-graph) shows where the middle beat loses people, and [batch producing Shorts](/blog/batch-produce-shorts) covers recording six of these in one sitting.
    `
  },

  {
    slug: 'tiktok-seo-guide',
    title: 'TikTok SEO: How to Get Your Videos Discovered',
    description: 'How TikTok search works, and the caption, keyword, and retention tactics that help new viewers find your videos.',
    date: '2026-10-10',
    category: 'Strategy',
    content: `
# TikTok SEO: How to Get Your Videos Discovered

TikTok is not a purely random feed. A large share of views start with search: people type "how to cut a podcast into shorts" into the search bar, and TikTok ranks videos by how well the spoken words, caption, and on-screen text match that query. TikTok SEO is the work of making your video the obvious result for the searches your audience already types.

## How TikTok Decides What to Show

Three signals matter most:

- **Your words.** The spoken audio, on-screen text, caption, and hashtags are all read by the system. A video that says the topic out loud and repeats it in the caption gives TikTok several matches to work with.
- **Viewer behavior.** Watch time, rewatches, and completion rate decide whether you keep the placement. SEO earns the slot; retention keeps it.
- **Account context.** Niche consistency helps. A channel that posts about editing tools is a more credible answer for editing searches than a random one-off.

## Start With the Search Phrase, Not the Hashtag

Before you record, decide the exact phrase a viewer would type. "How to add captions to TikTok" beats a generic trend tag every time. Then build the video around it:

1. **Say the phrase in the first ten seconds.** Spoken words are transcribed and indexed.
2. **Put it in the caption.** The caption is the strongest text signal; keep it to one or two natural sentences.
3. **Burn it into the on-screen text.** Visual text reinforces the same match.
4. **Use three to five specific hashtags.** Mix the exact phrase with one or two broad community tags. Hashtags are a hint, not a strategy — thirty of them make you look spammy.

### Write Titles People Actually Search

Answer-first titles outperform clever ones. "How to Add Auto Captions to TikTok (30-Second Method)" tells both the system and the viewer exactly what they get. Question formats — "Why are my Reels blurry?" — map to how people search when they have a problem.

## Retention Is the Second Half of SEO

A perfect keyword match that nobody watches gets replaced within days. The same rules from the [Viral Hooks Masterclass](/blog/viral-hooks-masterclass) apply to search traffic: open on the payoff, remove dead air, and watch [retention](/blog/read-a-retention-graph) in analytics. Search visitors usually have stronger intent than feed visitors — they stayed because the video answers their question, so keep it direct and skip the long intro.

## Repurpose One Idea Into Several Answers

One recording can target several related searches. A single tutorial on captioning can become "how to add captions," "best caption style for TikTok," and "why captions increase watch time." Cut three vertical versions from the same footage, adjust the spoken line, caption, and on-screen text for each phrase, and publish them across a week.

That is exactly the workflow in [repurposing long videos](/blog/repurposing-long-videos) — and NexusCut's editor does it in the browser: upload once, trim on the timeline, [generate captions](/blog/auto-captions-guide), and export each variant.

## Measure What Search Traffic Does

In analytics, compare search-driven views against feed views for watch time and completion. Search viewers who stay are your best signal that the phrasing is right. Double down on the phrases that already bring steady views, and refresh older videos with a clearer spoken line before re-uploading.

## Make Discovery a Habit

TikTok SEO is not a trick you apply after publishing — it shapes the video before you record. Pick the phrase, say it, caption it, show it on screen, then earn the placement with retention.

[Open the NexusCut editor](/editor) to cut your next batch, or start with the [7-Day Shorts Challenge](/creator-challenge) to publish every day for a week.
`,
  },
];
