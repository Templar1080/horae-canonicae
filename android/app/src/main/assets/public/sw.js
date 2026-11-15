/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "b716504cee1ff4dc5c70ba3dcd33ee54"
  }, {
    "url": "pwa-512x512.png",
    "revision": "527db25fd4c46f6844a4eb3bf9226245"
  }, {
    "url": "pwa-192x192.png",
    "revision": "85fcd8381061bac08fa5afe9cd1e5021"
  }, {
    "url": "index.html",
    "revision": "d5951e8795df94f9548091346e59d493"
  }, {
    "url": "icon.svg",
    "revision": "a65f576566180f325dafe4cc577657c3"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b180ad6c8e8c82403820aab691e0ead6"
  }, {
    "url": "audio/cathedral_bell.mp3",
    "revision": "147206f8ec8aa34cecc876428305673a"
  }, {
    "url": "assets/web-C5s7YSFH.js",
    "revision": null
  }, {
    "url": "assets/index-CtUyVHHW.js",
    "revision": null
  }, {
    "url": "assets/index-B-2DZYZb.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b180ad6c8e8c82403820aab691e0ead6"
  }, {
    "url": "icon.svg",
    "revision": "a65f576566180f325dafe4cc577657c3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "85fcd8381061bac08fa5afe9cd1e5021"
  }, {
    "url": "pwa-512x512.png",
    "revision": "527db25fd4c46f6844a4eb3bf9226245"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "b716504cee1ff4dc5c70ba3dcd33ee54"
  }, {
    "url": "manifest.webmanifest",
    "revision": "d566065b68791eab451301cf02b7afa9"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
