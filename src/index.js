import React from 'react';
import ReactDOM from 'react-dom/server';

/**
 * Attempt to load a component from a require path.
 *
 * @param  {Function} requireFn The require function based on the environment for your dust template.
 * @param  {String} component A path to require the component.
 * @return {Promise}
 */
function loadComponent (requireFn, component) {
	return new Promise((resolve, reject) => {
		try {
			const module = requireFn(component);
			resolve(module);
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Write a failure message to the dust output.
 *
 * @param  {String} message
 * @param  {Object} chunk
 * @param  {Object} params
 * @return {Object}
 */
function writeFailureMessage (message, chunk, params) {
	console.error(message);

	const errorDiv = `
		<div>${message} - params: ${JSON.stringify(params)}</div>
	`;

	return chunk.map((innerChunk) => {
		return innerChunk.write(errorDiv).end();
	});
}

/**
 * Create a dust helper for rendering React components.
 *
 * @param  {Function} requireFn The require function based on the environment for your dust template.
 * @return {Function} The dust-react helper.
 */
export default function dustHelperReact (requireFn) {
	return function (chunk, context, bodies, params) {
		const { component } = params;

		if (typeof component !== 'string') {
			return writeFailureMessage('dust-react: "component" is a required parameter and must be a string', chunk, params)
		}

		let props;

		if (params.props) {
			props = params.props;
		} else {
			delete params.component;
			props = params;
		}

		const LoadedComponent = loadComponent(requireFn, component);

		return chunk.map((innerChunk) => {
			return LoadedComponent.then((module) => {
				const renderedComponent = ReactDOM.renderToString(React.createElement(module, props));
				return innerChunk.write(renderedComponent).end();
			});
		});
	}
}
