/**
 * Retired legacy endpoint.
 *
 * It previously accepted an FFmpeg command from the browser and executed it on
 * the server. Exports must be generated from a server-owned edit model, never
 * from client-provided shell syntax.
 */
export async function POST() {
  return Response.json(
    { error: 'This legacy export endpoint is unavailable.' },
    { status: 410 },
  );
}
