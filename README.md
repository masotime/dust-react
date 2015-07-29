# dust-react

_Note_: This component has been updated to use Babel instead of react-tools. Testing has also been added.

Dust helper to render React components. Currently tailored to Kraken, although _theoretically_ it should work everywhere.

The helper is a function that takes 2 arguments, `dust` and an `options` object. Valid options are:

* `relativePath` - path to react components. The path is relative to `process.cwd()`

NOTE: The helper originally included bundalo that would load content automatically, but I decided against integrating it.

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
                            "arguments": { "relativePath": "public/js/react" } }
                        ]
                    }, .....
                ]
            }
        }
    }

Note the key lines under `view engines > js > renderer > arguments[0] > helpers`.

## Use in dust files.

e.g.

	{@react
        component="textfield"
        componentId="fruitControl"
        props=reactProps
	/}

A react component is declared via the parameters `component` and `componentId`.

* `component` (**required**) must point to an actual `.jsx` file located in `relativePath` as defined under the setup.
* `componentId` (**required**) is an id that is assigned to a `<div>` that wraps the rendered React component.

React props are passed in via the "props" attribute. If your props contain i18n content, you will need to make the correct locale-specific strings available as part of the props passed in via the model.

## NOTES:

This is a server-side only helper. Thus, React components must follow the CommonJS standard. UMD defined components are recommended, see <https://github.com/umdjs/umd/blob/master/returnExports.js>

### TODO

1. Find a magical way to synchronize rendering client-side as well