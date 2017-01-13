import dustHelperReact from './index';
import expect from 'jest-matchers';
import { TestComponent } from '../test/fixtures/test-component';
import dust from 'dustjs-linkedin';
import fs from 'fs';
import path from 'path';
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

      configureDust(dustHelperReact(rjsMock, window));
    });

    it('should render the component', () => {
      return renderTestCases()
        .then(($) => {
          const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot=".*" data-reactid=".*" data-react-checksum=".*"></div>`);
          const testCase = $('#test-case-no-props').html();
          expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
        });
    });
  });

  describe('given we are in a commonJS context', () => {
    beforeEach(() => {
      const requireFn = jest.fn();
      requireFn.mockReturnValue(TestComponent);
      configureDust(dustHelperReact(requireFn, global));
    });

    describe('given no properties', () => {
      it('should render the component', () => {
        return renderTestCases()
          .then(($) => {
            const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot=".*" data-reactid=".*" data-react-checksum=".*"></div>`);
            const testCase = $('#test-case-no-props').html();
            expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
          });
      });
    });

    describe('given variadic properties as params', () => {
      it('should render the component', () => {
        return renderTestCases({
          example: 'test-value'
        }).then(($) => {
          const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot=".*" data-reactid=".*" data-react-checksum=".*">test-value</div>`);
          const testCase = $('#test-case-variadic-props').html();
          expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
        });
      });
    });

    describe('given properties passed as a single param', () => {
      it('should render the component', () => {
        return renderTestCases({
          explicitProps: {
            example: 'test-value'
          }
        }).then(($) => {
          const expectedHtmlRegex = new RegExp(`<div class="test-case" data-reactroot=".*" data-reactid=".*" data-react-checksum=".*">test-value</div>`);
          const testCase = $('#test-case-explicit-props').html();
          expect(testCase).toEqual(expect.stringMatching(expectedHtmlRegex));
        });
      });
    });
  });
});

function configureDust (helper) {
  dust.helpers = {
    react: helper
  };
}

function renderTestCases (context = {}) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, '../test/fixtures/test.dust'), 'utf8', (err, testFile) => {
      if (err) {
        return reject(err);
      }

      const compiled = dust.compile(testFile, 'test');
      dust.loadSource(compiled);

      dust.render('test', context, (err, renderedTest) => {
        if (err) {
          return reject(err);
        }

        resolve(cheerio.load(renderedTest));
      });
    });
  });
}
