import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashSessionId } from '@/lib/auth';

type InputWord = { id: string; text: string; start: number; end: number };
type Suggestion = { wordIds: string[]; reason: 'filler' | 'repetition'; label: string };

const fillerWords = new Set([
  'um', 'umm', 'uh', 'uhh', 'erm', 'er', 'hmm', 'hm',
  'basically', 'actually', 'literally', 'like',
]);

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');

export async function POST(request: Request) {
  const sessionId = (await cookies()).get('nexus_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Sign in to use Nexus ScriptCut.' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: hashSessionId(sessionId) } });
  if (!user?.isPro || !['pro', 'agency'].includes(user.planTier)) {
    return NextResponse.json({ error: 'Nexus ScriptCut is available on the Pro plan.', code: 'PRO_REQUIRED' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { words?: InputWord[] } | null;
  const words = body?.words;
  if (!Array.isArray(words) || words.length === 0 || words.length > 20000) {
    return NextResponse.json({ error: 'Provide between 1 and 20,000 transcript words.' }, { status: 400 });
  }

  const validWords = words.filter(word =>
    typeof word.id === 'string'
    && typeof word.text === 'string'
    && Number.isFinite(word.start)
    && Number.isFinite(word.end)
    && word.end >= word.start
  );
  if (validWords.length !== words.length) {
    return NextResponse.json({ error: 'The transcript contains invalid word timing data.' }, { status: 400 });
  }

  const suggestions: Suggestion[] = [];
  validWords.forEach(word => {
    const normalized = normalize(word.text);
    if (fillerWords.has(normalized)) suggestions.push({ wordIds: [word.id], reason: 'filler', label: `Filler: ${word.text}` });
  });

  // Flag immediate repeated words and short restarted phrases. Suggestions are
  // never applied automatically; the creator reviews each proposed deletion.
  for (let index = 1; index < validWords.length; index++) {
    const current = normalize(validWords[index].text);
    const previous = normalize(validWords[index - 1].text);
    if (current && current === previous) {
      suggestions.push({ wordIds: [validWords[index - 1].id], reason: 'repetition', label: `Repeated word: ${validWords[index - 1].text}` });
    }
  }

  for (let size = 2; size <= 4; size++) {
    for (let index = size; index + size <= validWords.length; index++) {
      const first = validWords.slice(index - size, index).map(word => normalize(word.text)).join(' ');
      const second = validWords.slice(index, index + size).map(word => normalize(word.text)).join(' ');
      if (first && first === second) {
        suggestions.push({
          wordIds: validWords.slice(index - size, index).map(word => word.id),
          reason: 'repetition',
          label: `Repeated phrase: ${validWords.slice(index - size, index).map(word => word.text).join(' ')}`,
        });
        index += size - 1;
      }
    }
  }

  const unique = [...new Map(suggestions.map(suggestion => [suggestion.wordIds.join('|'), suggestion])).values()];
  return NextResponse.json({ suggestions: unique });
}
