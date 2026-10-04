export const COMPONENT_CATALOG = [
  { label: 'Básicos', items: [
    ['text', 'Texto', 'T'], ['heading', 'Título', 'H'], ['button', 'Botón', '▱'],
    ['input', 'Input', '▭'], ['textarea', 'Textarea', '▤'], ['checkbox', 'Checkbox', '☑'],
    ['radio', 'Radio', '◉'], ['image', 'Imagen', '▧'], ['rectangle', 'Rectángulo', '□'], ['line', 'Línea', '─'],
  ] },
  { label: 'Componentes', items: [
    ['navbar', 'Navbar', '▔'], ['sidebar', 'Sidebar', '◧'], ['card', 'Card', '▣'],
    ['form', 'Formulario', '☷'], ['table', 'Tabla', '▦'], ['footer', 'Footer', '▁'],
  ] },
];

export function renderCatalog(container) {
  for (const group of COMPONENT_CATALOG) {
    const section = document.createElement('section');
    section.className = 'catalog-section';
    const heading = document.createElement('h2');
    heading.textContent = group.label;
    const items = document.createElement('div');
    items.className = 'catalog-items';
    for (const [type, label, icon] of group.items) {
      const button = document.createElement('button');
      button.className = 'catalog-item';
      button.disabled = true;
      button.dataset.componentType = type;
      button.title = `${label} · disponible en una próxima etapa`;
      const symbol = document.createElement('span');
      symbol.className = 'catalog-icon';
      symbol.textContent = icon;
      symbol.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = label;
      button.append(symbol, name);
      items.append(button);
    }
    section.append(heading, items);
    container.append(section);
  }
}
