const COMMON_STYLES = {
  fontSize: 16, textAlign: 'left', backgroundColor: '#ffffff',
  borderColor: '#a0a0a0', borderWidth: 1, borderRadius: 0, color: '#333333',
};
const GEOMETRY_PROPERTIES = ['x', 'y', 'width', 'height'];
const APPEARANCE_PROPERTIES = ['backgroundColor', 'borderColor', 'borderWidth', 'borderRadius'];
const TEXT_PROPERTIES = [...GEOMETRY_PROPERTIES, 'content', 'fontSize', 'textAlign', ...APPEARANCE_PROPERTIES];

function defineComponent(name, icon, width, height, content, styles, render, editableProperties = TEXT_PROPERTIES, options = {}) {
  return {
    name, icon, group: options.group ?? 'Básicos', contentFields: options.contentFields ?? null, minimumSize: options.minimumSize, defaults: { width, height, content, styles: { ...COMMON_STYLES, ...styles } },
    editableProperties, render,
  };
}

function renderText(element) {
  const content = document.createElement('div');
  content.className = 'component-content component-text';
  content.textContent = element.content;
  return content;
}

function renderField(element) {
  const content = renderText(element);
  content.classList.add('component-field');
  return content;
}

function renderChoice(element) {
  const content = document.createElement('div');
  content.className = 'component-content component-choice';
  const marker = document.createElement('span');
  marker.className = `choice-marker ${element.type === 'radio' ? 'radio-marker' : ''}`;
  marker.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = element.content;
  content.append(marker, label);
  return content;
}

function renderImage(element) {
  const content = document.createElement('div');
  content.className = 'component-content component-image';
  const icon = document.createElement('span');
  icon.className = 'placeholder-icon';
  icon.textContent = '▧';
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = element.content;
  content.append(icon, label);
  return content;
}

function renderShape() {
  const content = document.createElement('div');
  content.className = 'component-content';
  return content;
}

function createBlockText(className, text) {
  const node = document.createElement('div');
  node.className = className;
  node.textContent = text;
  return node;
}

function renderCard(element) {
  const layout = document.createElement('div');
  layout.className = 'component-content card-layout';
  const title = createBlockText('card-title', element.content.title);
  const description = createBlockText('card-description', element.content.description);
  layout.append(title, description);
  if (element.content.buttonText) layout.append(createBlockText('card-button', element.content.buttonText));
  return layout;
}

function renderNavbar(element) {
  const layout = document.createElement('div');
  layout.className = 'component-content navbar-layout';
  const brand = createBlockText('navbar-brand', element.content.brand);
  const links = document.createElement('div');
  links.className = 'navbar-links';
  for (const text of element.content.links.split('\n').map(text => text.trim()).filter(Boolean)) {
    links.append(createBlockText('navbar-link', text));
  }
  layout.append(brand, links);
  return layout;
}

export function isValidContent(type, content) {
  const fields = COMPONENT_TYPES[type]?.contentFields;
  if (!fields) return typeof content === 'string';
  return content !== null && typeof content === 'object' && !Array.isArray(content) &&
    fields.every(field => typeof content[field.key] === 'string') &&
    Object.keys(content).every(key => fields.some(field => field.key === key));
}

// El catálogo es la fuente de nombres, valores iniciales, propiedades y representación.
export const COMPONENT_TYPES = {
  text: defineComponent('Texto', 'T', 240, 48, 'Escribí tu texto aquí', { borderWidth: 0, backgroundColor: 'transparent' }, renderText),
  heading: defineComponent('Título', 'H', 300, 56, 'Título de la sección', { fontSize: 26, borderWidth: 0, backgroundColor: 'transparent' }, renderText),
  button: defineComponent('Botón', '▱', 140, 42, 'Botón', { textAlign: 'center', backgroundColor: '#ededed', borderRadius: 4 }, renderField),
  input: defineComponent('Input', '▭', 280, 44, 'Ingresá un valor', { borderRadius: 3 }, renderField),
  textarea: defineComponent('Textarea', '▤', 280, 112, 'Escribí un mensaje…', { borderRadius: 3 }, renderField),
  checkbox: defineComponent('Checkbox', '☑', 240, 36, 'Opción de selección', { borderWidth: 0, backgroundColor: 'transparent' }, renderChoice),
  radio: defineComponent('Radio button', '◉', 240, 36, 'Opción de selección', { borderWidth: 0, backgroundColor: 'transparent' }, renderChoice),
  image: defineComponent('Imagen', '▧', 280, 180, 'Imagen placeholder', { backgroundColor: '#ededed', textAlign: 'center' }, renderImage),
  rectangle: defineComponent('Rectángulo', '□', 240, 140, '', { backgroundColor: '#ededed' }, renderShape, [...GEOMETRY_PROPERTIES, 'backgroundColor', 'borderColor', 'borderWidth', 'borderRadius']),
  line: defineComponent('Línea', '─', 280, 2, '', { backgroundColor: '#777777', borderWidth: 0 }, renderShape, [...GEOMETRY_PROPERTIES, 'backgroundColor']),
  navbar: defineComponent('Navbar', '▔', 340, 72, { brand: 'Mi sitio', links: 'Inicio\nProductos\nContacto' }, { fontSize: 14 }, renderNavbar, TEXT_PROPERTIES, {
    group: 'Componentes', minimumSize: { width: 180, height: 48 },
    contentFields: [
      { key: 'brand', label: 'Marca o nombre', type: 'text' },
      { key: 'links', label: 'Enlaces (uno por línea)', type: 'textarea' },
    ],
  }),
  sidebar: { name: 'Sidebar', icon: '◧', group: 'Componentes' },
  card: defineComponent('Card', '▣', 280, 220, { title: 'Título de la card', description: 'Una breve descripción del contenido.', buttonText: 'Ver más' }, { borderRadius: 4 }, renderCard, TEXT_PROPERTIES, {
    group: 'Componentes', minimumSize: { width: 140, height: 120 },
    contentFields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'buttonText', label: 'Texto del botón (opcional)', type: 'text' },
    ],
  }),
  form: { name: 'Formulario', icon: '☷', group: 'Componentes' },
  table: { name: 'Tabla', icon: '▦', group: 'Componentes' },
  footer: { name: 'Footer', icon: '▁', group: 'Componentes' },
};

export function createComponent(type, id, position) {
  const definition = COMPONENT_TYPES[type];
  if (!definition?.defaults) throw new Error(`Componente no disponible: ${type}`);
  return {
    id, type, x: position.x, y: position.y,
    ...definition.defaults, content: structuredClone(definition.defaults.content), styles: { ...definition.defaults.styles },
  };
}

export function renderComponent(element) {
  const definition = COMPONENT_TYPES[element.type];
  const wrapper = document.createElement('div');
  wrapper.className = `wireframe-element component-${element.type}`;
  wrapper.dataset.elementId = element.id;
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'button');
  const label = definition.contentFields ? element.content[definition.contentFields[0].key] : element.content;
  wrapper.setAttribute('aria-label', `Seleccionar ${definition.name}: ${label || element.id}`);
  Object.assign(wrapper.style, {
    left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`,
    fontSize: `${element.styles.fontSize}px`, textAlign: element.styles.textAlign,
    color: element.styles.color, backgroundColor: element.styles.backgroundColor,
    borderColor: element.styles.borderColor, borderWidth: `${element.styles.borderWidth}px`,
    borderRadius: `${element.styles.borderRadius}px`,
  });
  wrapper.style.setProperty('--text-justify', { left: 'flex-start', center: 'center', right: 'flex-end' }[element.styles.textAlign]);
  wrapper.append(definition.render(element));
  return wrapper;
}

export function renderCatalog(container) {
  container.replaceChildren();
  for (const group of ['Básicos', 'Componentes']) {
    const section = document.createElement('section');
    section.className = 'catalog-section';
    const heading = document.createElement('h2');
    heading.textContent = group;
    const items = document.createElement('div');
    items.className = 'catalog-items';
    for (const [type, definition] of Object.entries(COMPONENT_TYPES)) {
      if (definition.group !== group) continue;
      const button = document.createElement('button');
      button.className = 'catalog-item';
      button.disabled = !definition.defaults;
      button.dataset.componentType = type;
      button.title = definition.defaults ? `Agregar ${definition.name}` : `${definition.name} · próximamente`;
      const symbol = document.createElement('span');
      symbol.className = 'catalog-icon';
      symbol.textContent = definition.icon;
      symbol.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = type === 'radio' ? 'Radio' : definition.name;
      button.append(symbol, name);
      items.append(button);
    }
    section.append(heading, items);
    container.append(section);
  }
}
