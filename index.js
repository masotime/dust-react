// THIS IS A SERVER-SIDE ONLY HELPER
'use strict';
var React = require('react'),
	path = require('path'),
	VError = require('verror');

var componentCache = {}, // memoization
	atom = '\u269b';

require('babel/register')({
	extensions: ['.jsx']
});

function loadComponent(relativePath, componentPath, callback) {
	var resolvedPath;
	if (!componentPath.match(/\.jsx$/)) {
		componentPath += '.jsx';
	}

	if (componentCache.hasOwnProperty(componentPath)) {
		return callback(null, componentCache[componentPath]);
	}

	try {
		resolvedPath = path.resolve(process.cwd(), relativePath, componentPath);
		componentCache[componentPath] = React.createFactory(require(resolvedPath));
	} catch (e) {
		return callback(new VError(e, 'Unable to load react component at ' + resolvedPath + ' (resolved from ' + componentPath + ')'));
	}

	return callback(null, componentCache[componentPath]);
}

function atomMessage(message) {
	return [atom, message, atom].join(' ');
}

function componentWrap(html, containerId) {
	return '<div id="' + containerId + '">' + html + '</div>';
}

module.exports = function (dust, options) {

	var relativePath = options && options.relativePath || 'public/js/react';

	if (!dust.helpers) {
		dust.helpers = {};
	}

	dust.helpers.react = function (chunk, context, bodies, param) {

		//log('chunk = %s', stringify(chunk,null,4));
		//log('context = %s', stringify(context,null,4));
		//log('bodies = %s', stringify(bodies,null,4));
		//log('param = %s', stringify(param,null,4));
		//log('locality = %s', context.get('context.locality'));

		var componentId, paramFailure = [], reactProps = param.props;

		// parameter checking
		['component', 'componentId'].forEach(function (requiredParam) {
			if (!(requiredParam in param)) {
				paramFailure.push(requiredParam + ' missing');
			}
		});

		if (paramFailure.length > 0) {
			return chunk.write(atomMessage(paramFailure.join(', ')));
		}

		// asynchronous dust rendering
		return chunk.map(function (innerChunk) {

			// component loading
			loadComponent(relativePath, param.component, function(err, reactComponent) {
				var renderedString;

				if (err) {
					console.error(err.stack);
					return innerChunk.end(atomMessage('Failure loading component ' + param.component + ', check logs'));
				} else {
					componentId = param.componentId;

					try {
						renderedString = componentWrap(React.renderToString(reactComponent(reactProps)), componentId);
					} catch(renderError) {
						console.error(renderError.stack);
						console.error('Props used', JSON.stringify(reactProps, null, 4));
						return innerChunk.end(atomMessage('Error rendering component - check logs'));
					}

					return innerChunk.end(renderedString);

				}
			});

		});

	}; // end dust.helpers.react = function () { ... }

};