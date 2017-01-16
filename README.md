# dust-react

A dust helper to render React components.

**Features:**

- Server & client rendering (using requireJS on the client)
- Allows passing React props as variadic or explicit params
- Gracefully fails on rendering errors

## Module Definition

*dust-react* provides the following ways of importing:

- Pre-compiled ES5 code for use in non-babel'd projects (`dust-react/lib`, which is also the main entry point when doing `require('dust-react')`)
- UMD module for use in the browser (`dust-react/dist`)

The module is the default export. If you're using CommonJS without babel transpiling import/exports, you'll need to explicitly reference the default export.

```js
const dustHelperReact = require('dust-react').default;
```

## Usage

*dust-react* works in both Node.js and AMD environments. Configuring the helper based on the environment allows loading modules in both contexts.

```js
dustHelperReact(options: object)
```

| Option         | Type     | Description                                                                                 |
| ---            | ---      | ---                                                                                         |
| requireFn      | Function | **Required** - The require function based on the environment                                |
| globalContext  | Object   | **Required** - The global context object (`global` in Node.js and `window` in the browser)  |
| componentDir   | String   | *Optional* - An absolute path for requiring components in Node.js                           |

### Example

```js
import dust from 'dustjs-linkedin';
import dustHelperReact from 'dust-react';
import path from 'path';

dust.helpers = dust.helpers || {};
dust.helpers.react = dustHelperReact({
  requireFn: require,
  globalContext: global,
  componentDir: path.resolve(__dirname, '../component')
});
```

## Helper

### Params

| Param       | Type    | Description                                                   |
| ---         | ---     | ---                                                           |
| component   | String  |**Required** - the path to require the module                  |
| props       | Object  | *optional* - Properties to be passed to `React.createElement` |
| namedExport | String  | *optional* - Uses the default export if not specified         |

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

### Named Exports

By default, *dust-react* will use the default export of the module. You can optionally specify a named export as well.

```html
<div id="module-mount">
  {@react component="react-module" namedExport="example" props=. /}
</div>
```

This is equivalent to:

```js
const component = require('react-module').example;

// or in ES6

import { example } from 'react-module';
```

## Component Paths

Component paths can be either a relative path or a package path.

* **Relative path**: `./local-component/example` (must start with a dot-slash)
* **Package path**: `some-npm-module`

### Relative Paths -- Node.js vs AMD

Under the hood, every path to a component for AMD becomes a package path. Passing in a relative path will result in requiring the module without the `./`. This allows you to reference a local file for rendering server-side and reference the same file from your RequireJS `baseUrl`.

## Tests

The tests are written in Jest.

```
npm test
```
