# Web Push notification

## What is it?

Web Push notification only work with two sides: A client (=Web App like React/Svelte/Astro/Vue...) and a server (=node server/cloudflare worker/deno/...). This library aims to drastically simplify both sides.

The **client library** part...

- works with every framework as long as you are using [vite](https://vitejs.dev) for your build
- thus works with Svelte, React, Vue, Qwik, Astro or just with plain JS.
- has a tiny footprint (<1kb)
- caveat: does install a service worker that may interferes with your primary service worker (if you have one). Further infos in the FAQ.

The **server library** part...

- works currently only on Node. (More information about the FAQ.)
- is mostly a simplified and half-modernized version of [web-push](https://www.npmjs.com/package/web-push).

**Both libraries** ...

- have independent imports. So you don't bloat your client side footprint.
- don't have to be used together! For example you could use [Rust web_push](https://docs.rs/web-push/latest/web_push/) for your server.


## How to use it

### Step 1: Create Vapid Keys

Just go to [this link](https://www.stephane-quantin.com/en/tools/generators/vapid-keys) and generate them. 


### Step 2: Create subscription on the client side

First:
`npm install web-push-notification`

In your client code:

```
import { newSubscription } from "web-push-notification/client"

// only works in safari if the user initiates this code. So a button "Subscribe now" is adviced 

const mySubscription = await newSubscription({
    applicationServerKey: "you-server-key", //created in step 1
});


```

... and send this subscription to your node/deno/cloudflare endpoint, that we´ll create in step 3.

```
const stringifiedSubscription = JSON.stringify(mySubscription)
await fetch('https://your-domain.com/subscribe', {body: stringifiedSubscription})

```


### Step 3: Create endpoint for saving on the server/function/edge function

This highly depends on your kind of server/function/edge function.

> **Note:** currently only works in Node!

```
// get subscription from the request
const newSubscription = request.body //depends on your type of server and/or library (like express)

// save somewhere. Most likely a DB like Postgres.
someImaginativeDB.saveSomewhere(newSubscription)

```


### Step 4: Send Notification
Again on the server: 
`npm install web-push-notification`


```
import { sendNotification } from "web-push-notification/server";

// get subscription from somewhere. Most likely a DB like Postgres.
const subscription = someImaginativeDB.get(...)

// create notification information. Full list of properties: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
const notification = {
    title: "....",
    options: {
        body: "...",
        data: { url: "https://www.your-domain/new-blog-post" }, // Recommended workaround. Actions are buggy in Safari AND in Chromium. More about that in the FAQs. 
    }
}

// your Vapid Details from Step 1
const vapidDetails = {
    'mailto:example@yourdomain.com', //This must be either a URL or a 'mailto:' address. For example: 'https://your-website.com/contact' or 'mailto: info@your-website.com'
    vapidPublicKey, 
    vapidPrivateKey //should be stored safely. Most likely as a secret environment variable.
}

const result = await sendNotification(notification, subscription, vapidDetails);

```


## FAQ

### What about Deno and Cloudflare workers?

The original aim for this package was to develop an universal package. But unfortunately that turned out quite difficult due to two reasons: Cryptography and very specific (time-consuming) protocols. 

The pain points:
- the Encrypted Content-Encoding for HTTP (RFC 8188)
- Voluntary Application Server Identification (VAPID) for Web Push (RFC 8292)

The OG package [web-push](https://www.npmjs.com/package/web-push) uses outdated libraries ([asn1.js](https://www.npmjs.com/package/asn1.js/v/4.10.1) -> new version would be [asn1js](https://www.npmjs.com/package/asn1js) and [http_ece](https://www.npmjs.com/package/http_ece)) and uses the "old" Crypto Node API instead of the new (universally supported) WebCrypto API. 
Don't get me wrong: The OG way does work perfectly but it is hard to replicate the protocols without deep knowledge about cryptography and without much spare time.

The smart solution I tried (but ultimately failed):
As the tasks are only data manipulation I thought I could do an extra clever solution: One universal WASM script (these are supported in Deno, Node and Cloudflare Workers!).
Rust (which can be compiled to WASM) has all the required libraries [ece](https://crates.io/crates/ece) and [vapid](https://docs.rs/vapid/latest/vapid/) or even [Rust web-push](https://crates.io/crates/web-push). Unfortunately these libraries depend on ancient c libraries that for some reasons [could't be compiled to WASM](https://github.com/sfackler/rust-openssl/issues/1016).
 
### Why is there aa special non-standard way to handle Actions ( {data: {url: ""}} )?

Main reason being the current Safari/WebKit implementation. While the official video ["Meet Web Push for Safari"](https://developer.apple.com/videos/play/wwdc2022/10098/) does display the wanted behavior, the reality is actually different. No click what so ever does emit a [event.action](https://developer.apple.com/forums/thread/726793).
And in Chromium a click upon an action does open a text input prompt for whatever reason. 
My advice: Present options on the page you define in options.data.url (and don't use the official options.actions atm).


### There is a bug or a feature is missing!

Feel free to contact me via [twitter](https://twitter.com/LeonFeron).

The repo is also open for Pull requests.

### Service Worker Scope

Every service worker is installed with a scope and there can only be one for each scope. 
The service worker JavaScript file is placed in your assets folder by vite. Thus the scope is - you guessed it - your asset path. 
If you have a SW it most likely is at a root level and is not bothered. But caching the asset folder with request handling by your main SW may not work.
 