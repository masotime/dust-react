# dust-helper-react

A dust helper to render React components.

**Features:**

- Server & client rendering (using requireJS on the client)
- Gracefully fails on rendering errors
- Allows passing React props as variadic or explicit params

## Module definition

This module provides the following methods for importing:

- Pre-compiled ES5 code for use in non-babel'd projects (`dust-helper-react/lib`)
- UMD module for use in the browser (`dust-helper-react/dist`)

The module is the default export. If you're using commonJS without babel transpiling import/exports, you'll need to explicitly reference the default export.

```js
const dustHelperReact = require('dust-helper-react').default;
```

## Usage

*dust-helper-react* works in both Node.js and AMD environments. The require function is passed in when creating the helper.

Adding the dust helper in either a Node.js or AMD environment:

```js
import dust from 'dustjs-linkedin';
import dustHelperReact from 'dust-helper-react';

dust.helpers.react = dustHelperReact(require);
```

Using the helper in a template:

```html
<div class="">
  {@react component="react-module" props=. /}
</div>
```

Props can also be variadic, allowing you to pass in params to the helper that become React props.

```html
<div class="">
  {@react component="react-book" title='Boop' /}
</div>
```

This is equivalent to:

```js
React.createElement(ReactBook, { title: 'boop' });
```

## Tests

The tests are written in Jest.

```
npm test
```
