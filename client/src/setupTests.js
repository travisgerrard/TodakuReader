// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock the window.matchMedia function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn().mockReturnValue(null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:5001/api';
process.env.REACT_APP_GOOGLE_CLIENT_ID = 'test-client-id';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    defaults: {
      baseURL: 'http://localhost:5001/api',
      headers: {}
    },
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }),
  defaults: {
    baseURL: '',
    headers: {}
  },
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  },
  get: jest.fn(),
  post: jest.fn()
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockReturnValue({ exp: Date.now() / 1000 + 3600 })
}));

// Mock styled-components
jest.mock('styled-components', () => {
  const React = require('react');
  
  const tags = [
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body',
    'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details',
    'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
    'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
    'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav',
    'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp',
    'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub',
    'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u',
    'ul', 'var', 'video', 'wbr'
  ];

  const styledFunction = (Component) => {
    return (...args) => {
      const StyledComponent = React.forwardRef((props, ref) => {
        return React.createElement(Component, { ...props, ref });
      });
      StyledComponent.displayName = `styled(${typeof Component === 'string' ? Component : Component.displayName || 'Component'})`;
      return StyledComponent;
    };
  };

  const styled = {};

  tags.forEach(tag => {
    styled[tag] = styledFunction(tag);
  });

  styled.div = styledFunction('div');
  styled.span = styledFunction('span');
  styled.p = styledFunction('p');
  styled.a = styledFunction('a');
  styled.button = styledFunction('button');
  styled.input = styledFunction('input');
  styled.select = styledFunction('select');
  styled.textarea = styledFunction('textarea');
  styled.form = styledFunction('form');
  styled.section = styledFunction('section');
  styled.header = styledFunction('header');
  styled.footer = styledFunction('footer');
  styled.nav = styledFunction('nav');
  styled.main = styledFunction('main');
  styled.article = styledFunction('article');
  styled.aside = styledFunction('aside');
  styled.h1 = styledFunction('h1');
  styled.h2 = styledFunction('h2');
  styled.h3 = styledFunction('h3');
  styled.h4 = styledFunction('h4');
  styled.h5 = styledFunction('h5');
  styled.h6 = styledFunction('h6');
  styled.ul = styledFunction('ul');
  styled.ol = styledFunction('ol');
  styled.li = styledFunction('li');
  styled.table = styledFunction('table');
  styled.tr = styledFunction('tr');
  styled.td = styledFunction('td');
  styled.th = styledFunction('th');
  styled.thead = styledFunction('thead');
  styled.tbody = styledFunction('tbody');
  styled.tfoot = styledFunction('tfoot');
  styled.img = styledFunction('img');
  styled.label = styledFunction('label');
  styled.fieldset = styledFunction('fieldset');
  styled.legend = styledFunction('legend');

  const defaultStyled = (Component) => styledFunction(Component);
  defaultStyled.div = styled.div;
  defaultStyled.span = styled.span;
  defaultStyled.p = styled.p;
  defaultStyled.a = styled.a;
  defaultStyled.button = styled.button;
  defaultStyled.input = styled.input;
  defaultStyled.select = styled.select;
  defaultStyled.textarea = styled.textarea;
  defaultStyled.form = styled.form;
  defaultStyled.section = styled.section;
  defaultStyled.header = styled.header;
  defaultStyled.footer = styled.footer;
  defaultStyled.nav = styled.nav;
  defaultStyled.main = styled.main;
  defaultStyled.article = styled.article;
  defaultStyled.aside = styled.aside;
  defaultStyled.h1 = styled.h1;
  defaultStyled.h2 = styled.h2;
  defaultStyled.h3 = styled.h3;
  defaultStyled.h4 = styled.h4;
  defaultStyled.h5 = styled.h5;
  defaultStyled.h6 = styled.h6;
  defaultStyled.ul = styled.ul;
  defaultStyled.ol = styled.ol;
  defaultStyled.li = styled.li;
  defaultStyled.table = styled.table;
  defaultStyled.tr = styled.tr;
  defaultStyled.td = styled.td;
  defaultStyled.th = styled.th;
  defaultStyled.thead = styled.thead;
  defaultStyled.tbody = styled.tbody;
  defaultStyled.tfoot = styled.tfoot;
  defaultStyled.img = styled.img;
  defaultStyled.label = styled.label;
  defaultStyled.fieldset = styled.fieldset;
  defaultStyled.legend = styled.legend;

  defaultStyled.createGlobalStyle = jest.fn().mockReturnValue(() => null);
  defaultStyled.css = jest.fn();
  defaultStyled.ThemeProvider = ({ children }) => children;
  defaultStyled.keyframes = jest.fn();

  return {
    default: defaultStyled,
    __esModule: true,
    css: jest.fn(),
    createGlobalStyle: jest.fn().mockReturnValue(() => null),
    keyframes: jest.fn(),
    ThemeProvider: ({ children }) => children
  };
});
