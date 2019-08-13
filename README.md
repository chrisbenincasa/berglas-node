# Overview

Node library to interact with [Berglas](https://github.com/GoogleCloudPlatform/berglas)-managed secrets in Google Cloud Platform.

# Usage

## Installation

```
yarn add chrisbenincasa/node-berglas
```

# Use Case

Currently, Berglas only supports the Go runtime on Cloud Functions. With this library, one is able to use Berglas secrets while running NodeJS functions on Cloud Functions.

## Interact

The library has two main functions: `resolve` and `substitute`.

`resolve` retrieves and deciphers a single Berglas secret.
`substitute` replaces environment variables values beginning with the Berglas prefix (`berglas://`) in the process with their resolved values.

## Examples

### Resolving a single secret

```js
// index.js

import { resolve } from "berglas-node";

let mySecret;

async function funcThatNeedsSecret() {
  if (!mySecret) {
    mySecret = await resolve(PROJECT_ID, "secrets-bucket/mySecret");
  }

  // Use deciphered secret value;
}

funcThatNeedsSecret();
```

### Substituting all environment vars at the start of an application

```js
// index.js

// Before:
// process.env.FOO=berglas://secrets-bucket/foo

import { substitute } from "berglas-node";

async function main() {
  await substitute();

  // Run application, pulling secrets from environvment vars
  // After: process.env.FOO=bar
}

main();
```

# Future

This is a very simplistic library to get basic Berglas functionality working in environvments like NodeJS on Cloud Functions. However, there is always room for improvement. Some ideas so far:

- Synchronous versions of functions. The benefit here is that then `substitute` could run immediately upon import and make integration with applications more seamless (and we don't have to wait for top-level await!)
- Listing, creating secrets

If you have any ideas or feature requests, please open an issue!

# License

This library is licensed under the MIT license. Do what you want!
