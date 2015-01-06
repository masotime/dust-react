Dust helper to render React components. Currently tailored to Kraken, although _theoretically_ it should work everywhere.

The helper is a function that takes 2 arguments, `dust` and an `options` object. Valid optiosn are:

* `relativePath` - path to react components. The path is relative to `process.cwd()`
* `enableMetadata` - PayPal specific option which doesn't really work correctly.

## Kraken 1.x setup

To make it work, in `config.json` (or `development.json` etc.), add the following:

    "view engines": {
        "js": {
            "module": "engine-munger",
            "renderer": {
                "method": "js",
                "arguments": [
                    { 
                        "cache": true, 
                        "helpers": [ { 
                            "name": "dust-react", 
                            "arguments": { "enableMetadata": false, "relativePath": "public/js/react" } } 
                        ]
                    }, .....
                ]
            }
        }
    }

Note the key lines under `view engines > js > renderer > arguments[0] > helpers`.

## Use in dust files.

e.g.

	{@react component="textfield" componentId="fruitControl" bundle="index"
		id="fruit"
		value="Pineapple"
		label="@field.fruit.label"
		placeholder="@field.fruit.placeholder"
		helpers=helpers
		className="paypal-input"
	/}

A react component is declared via the parameters `component` and `componentId`. 

* `component` (**required**) must point to an actual `.jsx` file located in `relativePath` as defined under the setup.
* `componentId` (**required**) is an id that is assigned to a `<div>` that wraps the rendered React component.
* `bundle` is the name of the bundle to load content.

Apart from the parameters above, all other parameters are passed directly to the React component, with a special provisio for strings that begin with `@`.

The module uses `bundalo` internally to load content for any parameter that is prefixed with `@`. It will search for properties files located at `locales/` and load the appropriate bundle as specified by the `bundle` parameter to the dust helper. The content is then resolved and passed to the component.

## NOTES:

This is a server-side only helper. Thus, React components must follow the CommonJS standard. UMD defined components are recommended, see <https://github.com/umdjs/umd/blob/master/returnExports.js>

### TODO

1. Add tests
2. Find a magical way to synchronize rendering client-side as well