import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute the real application with a small DOM harness. Navigation is recorded;
// these checks never open WhatsApp or send a message.
function createPage({ valid = true } = {}) {
  const elements = new Map();
  const navigations = [];
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      listeners: {}, dataset: {}, value: '', hidden: true,
      addEventListener(type, callback) { this.listeners[type] = callback; },
      querySelectorAll() { return []; },
      setAttribute() {}, close() {}, focus() {},
      reportValidity() { return valid; }
    });
    return elements.get(selector);
  }
  const fields = { name: '  João & Ana  ', city: '  São José  ', room: 'Sala e painel de TV', idea: 'Painel #1 & armário + nichos\nMedida: 3,20 m / luz “quente”' };
  const swatch = element('nogueira');
  swatch.dataset = { material: 'nogueira' };
  vm.runInNewContext(readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8'), {
    document: {
      querySelector: element,
      querySelectorAll: (selector) => selector === '.swatch' ? [swatch] : [],
      addEventListener() {}
    },
    window: { location: { assign: (url) => navigations.push(url) } },
    matchMedia: () => ({ addEventListener() {} }),
    requestAnimationFrame: (callback) => callback(),
    FormData: class { get(key) { return fields[key]; } }
  });
  return {
    fields, navigations,
    click: (selector) => element(selector).listeners.click(),
    submit() {
      let prevented = false;
      const form = element('#project-form');
      form.listeners.submit({ currentTarget: form, preventDefault() { prevented = true; } });
      assert.equal(prevented, true);
    }
  };
}

test('valid project opens the company WhatsApp with complete, correctly encoded text', () => {
  const page = createPage();
  page.submit();
  assert.equal(page.navigations.length, 1);
  const url = new URL(page.navigations[0]);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5547991102938');
  assert.deepEqual([...url.searchParams.keys()], ['text']);
  assert.equal(url.hash, '');
  const message = url.searchParams.get('text');
  assert.ok(message.includes('Meu nome é João & Ana.'));
  assert.ok(message.includes('Sou de São José'));
  assert.ok(message.includes('Ambiente: Sala e painel de TV.'));
  assert.ok(message.includes('Carvalho claro (amostra ilustrativa)'));
  assert.ok(message.endsWith(`Minha ideia: ${page.fields.idea}`));
  assert.ok(!message.includes('Gostei da referência:'));
});

test('invalid form stays on the page', () => {
  const page = createPage({ valid: false });
  page.submit();
  assert.equal(page.navigations.length, 0);
});

test('message follows material and gallery choices, omitting unrelated references', () => {
  const page = createPage();
  page.click('nogueira');
  page.click('#gallery-contact');
  page.submit();
  let text = new URL(page.navigations[0]).searchParams.get('text');
  assert.ok(text.includes('Nogueira (amostra ilustrativa)'));
  assert.ok(text.includes('Gostei da referência: Um lugar para ficar.'));
  page.fields.room = 'Banheiro';
  page.submit();
  text = new URL(page.navigations[1]).searchParams.get('text');
  assert.ok(text.includes('Ambiente: Banheiro.'));
  assert.ok(!text.includes('Gostei da referência:'));
});
