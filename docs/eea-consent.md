# Consent, advertising and Europe

NexusCut uses Google's Privacy & messaging consent message (the certified CMP,
**CMP ID 300**) for visitors in the EEA, the UK and Switzerland, and its own
cookie banner everywhere else. This file records how the two fit together and
what has to be switched on in the AdSense account.

## How the site behaves

| Visitor | Advertising consent | Analytics consent |
| --- | --- | --- |
| EEA / UK / CH | Google's message | Google's message (Consent Mode) |
| Everywhere else | NexusCut's banner | NexusCut's banner |

1. A visitor whose timezone is in a covered region (see `src/lib/region.ts`)
   causes the AdSense tag to load before they have chosen anything.
2. Google's message is delivered **by that tag**, so this early load is what
   makes the certified CMP available at all. Google blocks personalised ads
   until the message is answered.
3. Once the CMP exposes the IAB TCF API, the site reads `gdprApplies`:
   - **true** — NexusCut's own banner stays hidden, and analytics starts only
     when Consent Mode reports `analytics_storage` as granted.
   - **false** — Google has decided European rules do not apply to this
     request, so NexusCut's banner takes over as usual.
4. If no CMP appears within 2.5 seconds (message not published, or the script is
   blocked), the site's banner takes over so the visitor is never left without a
   way to choose. Because that path relies on the site's own consent rather than
   the certified CMP, no personalised advertising should be served in those
   regions until the message below is published.

The footer **Cookie settings** link reopens Google's message in those regions
(`googlefc.showRevocationMessage()`), and falls back to the site banner when the
CMP is not on the page.

## What must be configured in AdSense

The site side is complete; these three are account settings and cannot be made
from the codebase.

1. **Privacy & messaging → European regulations → create and publish a message**
   targeting the EEA, the UK and Switzerland, with `nexuscut.io` selected as the
   site. Publishing this is what makes the site compliant for European ads.
2. **Enable Consent Mode for analytics in that message.** Without it,
   `analyticsStoragePurposeConsentStatus` is reported as `NOT_CONFIGURED`, the
   site treats that as "no consent" (it is not consent), and Google Analytics
   collects nothing from European visitors while Google's message owns consent.
3. ~~Create two display ad units~~ — done. The account now holds **NexusCut -
   In-article** (`7947416899`) and **NexusCut - Footer** (`4344222968`), and both
   ids are baked in as defaults in `src/app/blog/[slug]/page.tsx`, with
   `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE` / `_FOOTER` as overrides. They are defaults
   rather than build-only values so a deploy cannot silently ship posts with an
   empty ad slot.

Verified on the live site: both `<ins>` elements are in the server HTML, the
AdSense tag loads, and each slot requests an ad at the container's real width.
Fill itself depends on Google having demand for a new unit on a low-traffic
page, so an empty frame on the first day is expected rather than a fault.

## Testing without a VPN

`next dev` accepts a development-only region override, compiled out of
production builds:

- `?consent=eu` — force the European path.
- `?consent=row` — force the rest-of-world path.

A real European visitor is the only way to see Google's message itself; Google
targets it by IP, so it cannot be triggered from a non-European connection.
