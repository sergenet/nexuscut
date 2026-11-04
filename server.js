const { createServer } = require('node:http');
const { parse } = require('node:url');
const next = require('next');

// `next start` uses Node's default five-minute request timeout. A large video
// from a phone can legitimately take longer to upload over Wi-Fi, so exports
// need a longer request window before they can join the render queue.
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url, true)));

  // Keep this aligned with Nginx's upload/proxy window. This only governs how
  // long an in-progress HTTP request may take; it does not keep render jobs
  // running concurrently or change the export queue limit.
  server.requestTimeout = 15 * 60 * 1000;
  server.headersTimeout = 60 * 1000;
  server.keepAliveTimeout = 65 * 1000;

  server.listen(3000, () => {
    console.log('NexusCut is ready on http://localhost:3000');
  });
});
