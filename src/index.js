import React from 'react';
import ReactDOM from 'react-dom/server';

/**
 * All require paths for AMD are assumed to be relative to the `baseUrl` configured
 * with RequireJS. If the user has passed a relative path for server-side rendering,
 * this will strip the relative part from the path.
 * 
 * @param   {String} componentPath
 * @returns {String}
 */
function createAmdComponentPath (componentPath) {
  if (componentPath.match(/^\.\//) !== null) {
    return componentPath.slice(2);
  }

  return componentPath;
}

/**
 * Resolve a path for CommonJS.
 * 
 * @param {String}   componentDir
 * @param {String}   componentPath
 * @returns {String}
 */
function createCommonJsComponentPath (componentDir, componentPath) {
  if (componentPath.match(/^\.\//) !== null) {
    return `${componentDir}/${componentPath.slice(2)}`;
  }

  return componentPath;
}

/**
 * Attempt to load a component from a require path.
 *
 * @param  {Object}  options 
 * @param  {String}  componentPath A path to require the component.
 * @return {Promise}
 */
function loadModule (options, componentPath) {
  const { requireFn, globalContext, componentDir } = options;

  return new Promise((resolve, reject) => {
    try {
      // AMD
      if (typeof globalContext.define === 'function' && globalContext.define.amd) {
        return requireFn(createAmdComponentPath(componentPath), (module) => {
          resolve(module);
        });
      }

      if (typeof componentDir !== 'string') {
        throw new Error('options.componentDir must be a string when rendering server-side');
      }

      // CommonJS
      const module = requireFn(createCommonJsComponentPath(componentDir, componentPath));
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
    <div><!-- dust-react: ${message} - params: ${JSON.stringify(params)} --></div>
  `;

  return chunk.map((innerChunk) => {
    return innerChunk.write(errorDiv).end();
  });
}

/**
 * Create a dust helper for rendering React components.
 *
 * @param  {Object}   options
 * @param  {Function} options.requireFn The require function based on the environment for your dust template.
 * @param  {Object}   options.globalContext The global context object (`global` in Node.js, `window` in the browser)
 * @param  {[String]} options.componentDir An absolute path to the component directory for server-side rendering.
 * @return {Function} The dust-react helper.
 */
export default function dustHelperReact (options) {
  const { requireFn, globalContext, componentDir } = options;

  if (typeof requireFn !== 'function') {
    throw new Error('dust-react: options.requireFn must be a function')
  }

  if (typeof globalContext !== 'object') {
    throw new Error('dust-react: options.globalContext must be an object');
  }

  return function (chunk, context, bodies, params) {
    const { component, namedExport } = params;

    delete params.component;
    delete params.namedExport;

    if (typeof component !== 'string') {
      return writeFailureMessage('"component" is a required parameter and must be a string', chunk, params);
    }

    const props = params.props || Object.assign({}, params);
    const loadedModulePromise = loadModule(options, component);

    return chunk.map((innerChunk) => {
      return loadedModulePromise
        .then((module) => {
          let ExportedComponent;

          if (namedExport) {
            ExportedComponent = module[namedExport];
          } else {
            ExportedComponent = module.default || module;
          }

          const renderedComponent = ReactDOM.renderToString(React.createElement(ExportedComponent, props));
          return innerChunk.write(renderedComponent).end();
        })
        .catch((err) => {
          return innerChunk.write(`dust-react: ${err.message}`).end();
        });
    });
  }
}
