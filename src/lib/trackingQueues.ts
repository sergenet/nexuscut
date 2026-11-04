// Match the providers' bootstrap protocols. Loading an SDK is not sufficient:
// queued commands must have the shape it understands, and later calls must reach it.
export type GoogleTag = (...args: unknown[]) => void;

export function createGoogleTag(enqueue: (command: IArguments) => void): GoogleTag {
  return function gtag() {
    // gtag.js distinguishes Arguments commands from plain dataLayer arrays.
    // eslint-disable-next-line prefer-rest-params
    enqueue(arguments);
  };
}

export type MetaPixelQueue = ((...args: unknown[]) => void) & {
  queue: IArguments[];
  callMethod?: (...args: unknown[]) => void;
  push?: MetaPixelQueue;
  loaded: boolean;
  version: string;
};

export function createMetaPixelQueue(): MetaPixelQueue {
  const pixel: MetaPixelQueue = function fbq() {
    if (pixel.callMethod) {
      // The SDK installs callMethod after draining the initial command queue.
      // eslint-disable-next-line prefer-rest-params
      Reflect.apply(pixel.callMethod, pixel, arguments);
    } else {
      // eslint-disable-next-line prefer-rest-params
      pixel.queue.push(arguments);
    }
  };
  pixel.queue = [];
  pixel.push = pixel;
  pixel.loaded = true;
  pixel.version = '2.0';
  return pixel;
}
