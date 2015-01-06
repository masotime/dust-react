/* global dust */
// THIS IS A SERVER-SIDE ONLY HELPER
'use strict';
require('node-jsx').install({extension: '.jsx'}); // allows requiring of .jsx files

var bundalo = require('bundalo'),
	React = require('react'),
	path = require('path'),
	util = require('util'),
	VError = require('verror');

var componentCache = {}, // memoization
	atom = '\u269b';

function loadComponent(relativePath, componentPath, callback) {
	var resolvedPath;
	if (!componentPath.match(/\.jsx$/)) {
		componentPath += '.jsx';
	}

	if (componentPath in componentCache) {
		return callback(null, componentCache[componentPath]);
	}
	
	try {
		resolvedPath = path.resolve(process.cwd(), relativePath, componentPath);
		componentCache[componentPath] = React.createFactory(require(resolvedPath));
	} catch (e) {
		return callback(new VError(e, 'Unable to load react component at ' + resolvedPath + ' (resolved from '+componentPath+')'));
	}

	return callback(null, componentCache[componentPath]);
}

function atomMessage(message) {
	return [atom, message, atom].join(' ');
}

function navigate(obj, trail) {
    // force trail to be an array
    if (!Array.isArray(trail)) {
    	trail = trail.split('.');
    }

    // recursion termination conditions
    if (!obj.hasOwnProperty(trail[0])) {
	    return;
	} else if (trail.length <= 1) {
    	return obj[trail[0]];
    } else {
    	// recurse
        return navigate(obj[trail[0]], trail.slice(1));
    }
}

function decorateMetadata(key, bundle, content, enableMetadata) {
	return enableMetadata && util.format('<edit data-key="%s" data-bundle="%s">%s</edit>', key, bundle, content) || content;
}

function mapContent(bundle, locality, params, enableMetadata, callback) {

	// placed outside so that it can be used for try-catch errors from bundalo
	function contentCallback(err, data) {
		if (err) {
			console.error(err.stack);
		}


		Object.keys(params).forEach(function transform(param) {
			var parts, result;

			parts = /^@(.+)$/.exec(params[param]);

			if (parts && parts.length && parts.length === 2) {
				if (err) {
					params[param] = atomMessage('failed to load '+locality+'/'+bundle);
				} else if (!bundle) {
					params[param] = atomMessage('bundle required to load content');
				} else {
					result = navigate(data, parts[1]);
					params[param] = result && decorateMetadata(parts[1], bundle, result, enableMetadata) || atomMessage('cannot find '+parts[1]+' in '+locality+'/'+bundle);
				}
			}
		});

		// there will never be an error, but content will reflect an error state
		callback(null, params);
	}

	locality = locality || 'en-US';
	enableMetadata = enableMetadata || false;

	var config, content;

	if (bundle) {
		config = {
			contentPath: 'locales/',
			engine: 'dust'
		};
		content = bundalo(config);
		content.get({
			bundle: bundle,
			locality: locality
		}, contentCallback );
	} else {
		// don't do anything
		contentCallback(null, {});
	}

}

function componentWrap(html, containerId) {
	return '<div id="'+containerId+'">'+html+'</div>';
}

module.exports = function (dust, options) {

	var relativePath = options && options.relativePath || 'public/js/react',
		enableMetadata = options && options.enableMetadata || false;

	if (!dust.helpers) {
		dust.helpers = {};
	}

	dust.helpers.react = function (chunk, context, bodies, param) {

		//log('chunk = %s', stringify(chunk,null,4));
		//log('context = %s', stringify(context,null,4));
		//log('bodies = %s', stringify(bodies,null,4));
		//log('param = %s', stringify(param,null,4));
		//log('locality = %s', context.get('context.locality'));

		var componentId, locality, bundle, paramFailure = [];

		// parameter checking
		['component', 'componentId'].forEach(function (requiredParam) {
			if (!(requiredParam in param)) {
				paramFailure.push(requiredParam+' missing');
			}
		});

		if (paramFailure.length > 0) {
			return chunk.write(atomMessage(paramFailure.join(', ')));	
		}		

		// get the default locality and bundle name
		locality = context.get('context.locality');
		bundle = param.bundle;

		// asynchronous dust rendering
		return chunk.map(function(chunk) {

			// component loading
			loadComponent(relativePath, param.component, function(err, reactComponent) {
				if (err) {
					console.error(err.stack);
					return chunk.end(atomMessage('Could not load component '+ param.component));
				} else {
					componentId = param.componentId;

					delete param.componentId;
					delete param.component;

					// content mapping
					mapContent(bundle, locality, param, enableMetadata, function(err, mappedParams) {
						var reactString;

						if (err) {
							console.error(err.stack);
							return chunk.end(atomMessage('Error loading content - check console'));
						}

						try {
							reactString = componentWrap(React.renderToString(reactComponent(mappedParams)), componentId);
						} catch(renderError) {
							console.error(renderError.stack);
							return chunk.end(atomMessage('Error rendering component - check console'));
						}

						return chunk.end(reactString);

					});

				}
			});

		});

	}; // end dust.helpers.react = function () { ... }

};