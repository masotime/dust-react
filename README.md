# dust-react

A dust helper to render React components.

**Features:**

- Server & client rendering (using requireJS on the client)
- Gracefully fails on rendering errors
- Allows passing React props as variadic or explicit params

## Module definition

This module provides the following methods for importing:

- Pre-compiled ES5 code for use in non-babel'd projects (`dust-react/lib`, which is also the main entry point when doing `require('dust-react')`)
- UMD module for use in the browser (`dust-react/dist`)

The module is the default export. If you're using CommonJS without babel transpiling import/exports, you'll need to explicitly reference the default export.

```js
const dustHelperReact = require('dust-react').default;
```

## Usage

*dust-react* works in both Node.js and AMD environments. The require function is passed in when creating the helper.

### Using the helper


```js
import dust from 'dustjs-linkedin';
import dustHelperReact from 'dust-react';

// Assuming the dust.helpers object already exists
dust.helpers.react = dustHelperReact(require);
```

The helper requires a reference to a **react component** as a string. This is what is used with the require function passed in when creating the helper.

```html
<div id="module-mount">
  {@react component="react-module" props=. /}
</div>
```

This equates to a require statement that looks like the following:

```js
require('react-module');
```

(*Note about AMD* - all modules are loaded asynchronously, and the rjs optimizer is not yet supported)

### Props

Props can also be variadic, allowing you to pass in params to the helper that become React props.

```html
<div id="module-mount">
  {@react component="react-book" title='Boop' pages=10 /}
</div>
```

This is equivalent to:

```js
React.createElement(ReactBook, { title: 'boop', pages: 10 });
```

## Tests

The tests are written in Jest.

```
npm test
```
