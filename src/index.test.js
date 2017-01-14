import dustHelperReact from './index';
import expect from 'jest-matchers';
import { TestComponent } from '../test/fixtures/test-component';
import dust from 'dustjs-linkedin';
import cheerio from 'cheerio';

describe('dust-helper-react', () => {
  afterEach(() => {
    window.define = undefined;
  });

  describe('given we are in an AMD context', () => {
    beforeEach(() => {
      const rjsMock = (modules, callback) => {
        callback(TestComponent);
      };

      // Set up AMD
      window.define = jest.fn();
      window.define.amd = {};

      configureDust(dustHelperReact({
        requireFn: rjsMock,
        globalContext: window
      }));
    });

    it('should render the component', () => {
      const template = `
        <div id="test-case-no-props">
          {@react component="test-component" /}
        </div>
      `;

      return renderTestCase(template)
        .then(($) => {
          const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot="[^"]*" data-reactid="[^"]*" data-react-checksum="[^"]*"></div>`);
          const testCase = $('#test-case-no-props').html();
          expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
        });
    });
  });

  describe('given we are in a commonJS context', () => {
    describe('and the module is a named export', () => {
      beforeEach(() => {
        const requireFn = jest.fn();
        requireFn.mockReturnValue({ test: TestComponent });
        configureDust(dustHelperReact({
          requireFn,
          globalContext: global,
          componentDir: '/'
        }));
      });

      it('should render the component', () => {
        const template = `
          <div id="test-case-named-export">
            {@react component="test-component" namedExport="test" /}
          </div>
        `;

        return renderTestCase(template)
          .then(($) => {
            const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot="[^"]*" data-reactid="[^"]*" data-react-checksum="[^"]*"></div>`);
            const testCase = $('#test-case-named-export');
            expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
          });
      });
    });

    describe('and the module is the default export', () => {
      beforeEach(() => {
        const requireFn = jest.fn();
        requireFn.mockReturnValue(TestComponent);
        configureDust(dustHelperReact({
          requireFn,
          globalContext: global,
          componentDir: '/'
        }));
      });

      describe('given no properties', () => {
        it('should render the component', () => {
          const template = `
            <div id="test-case-no-props">
              {@react component="test-component" /}
            </div>
          `;

          return renderTestCase(template)
            .then(($) => {
              const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot="[^"]*" data-reactid="[^"]*" data-react-checksum="[^"]*"></div>`);
              const testCase = $('#test-case-no-props').html();
              expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
            });
        });
      });

      describe('given variadic properties as params', () => {
        it('should render the component', () => {
          const template = `
            <div id="test-case-variadic-props">
              {@react component="test-component" example="test-value" /}
            </div>
          `;

          return renderTestCase(template, {
            example: 'test-value'
          }).then(($) => {
            const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot="[^"]*" data-reactid="[^"]*" data-react-checksum="[^"]*">test-value</div>`);
            const testCase = $('#test-case-variadic-props').html();
            expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
          });
        });
      });

      describe('given properties passed as a single param', () => {
        it('should render the component', () => {
          const template = `
            <div id="test-case-explicit-props">
              {@react component="test-component" props=explicitProps /}
            </div>
          `;

          return renderTestCase(template, {
            explicitProps: {
              example: 'test-value'
            }
          }).then(($) => {
            const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot="[^"]*" data-reactid="[^"]*" data-react-checksum="[^"]*">test-value</div>`);
            const testCase = $('#test-case-explicit-props').html();
            expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
          });
        });
      });
    });
  });
});

/**
 * Set up a dust helper.
 * 
 * @param {Function} helper
 */
function configureDust (helper) {
  dust.helpers = {
    react: helper
  };
}

/**
 * Render a test case with dust.
 * 
 * @param {String} template
 * @param {Object} context
 * @returns {Promise}
 */
function renderTestCase (template, context = {}) {
  return new Promise((resolve, reject) => {
    const compiled = dust.compile(template, 'test');
    dust.loadSource(compiled);

    dust.render('test', context, (err, renderedTest) => {
      if (err) {
        return reject(err);
      }

      resolve(cheerio.load(renderedTest));
    });
  });
}
