const pluginNamespace = "volkmann-design-code/kirby-layout-attributes";

window[pluginNamespace] = window[pluginNamespace] ?? {};
window[pluginNamespace].functions = window[pluginNamespace].functions ?? {};
window[pluginNamespace].functions.isLayoutField = (field) => {
  return (
    Array.isArray(field) &&
    field.length > 0 &&
    field.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        "attrs" in entry &&
        "columns" in entry &&
        "id" in entry &&
        typeof entry.attrs === "object" &&
        Array.isArray(entry.columns),
    )
  );
};
window[pluginNamespace].functions.addLayoutAttrs = (layoutField) => {
  const columnId = layoutField.columns[0].id;
  /**
   * @type {HTMLElement} layoutEl
   */
  let layoutEl = document.querySelector(
    `.k-layout:has(.k-layout-column[id="${columnId}"])`,
  );

  if (!layoutEl) {
    return;
  }

  const attrKeys = Object.keys(layoutField.attrs);
  for (const key of attrKeys) {
    const val = layoutField.attrs[key];
    layoutEl.setAttribute(`data-attr-${key}`, val);
    layoutEl.style.setProperty(`--attr-${key}`, val);
  }
};

window.panel.plugin("volkmann-design-code/kirby-layout-attributes", {
  created(Vue) {
    const isKirby4 = '$store' in Vue;
    const isKirby5 = 'events' in window.panel;
    
    if (isKirby5) {
      function processFields(fields) {
        for (const fieldName in fields) {
          const field = fields[fieldName];
          if (!window[pluginNamespace].functions.isLayoutField(field)) {
            continue;
          }

          for (const layout of field) {
            window[pluginNamespace].functions.addLayoutAttrs(layout);
          }
        }
      }

      const currentContent = panel.content.version('latest');
      setTimeout(() => {
        processFields(currentContent);
      }, 500)

      window.panel.events.on('content.save', ({values}) => {
        processFields(values);
      })
    }
    else if (isKirby4) {
      Vue.$store.subscribeAction({
        after: (action, state) => {
          if (action.type === "content/create") {
            // TODO: Refactor to a more elegant solution to wait for the dom to be ready, e.g. MutationObserver on the block IDs
            setTimeout(() => {
              for (const fieldName in action.payload.content) {
                const field = action.payload.content[fieldName];
                if (!window[pluginNamespace].functions.isLayoutField(field)) {
                  continue;
                }
  
                for (const layout of field) {
                  window[pluginNamespace].functions.addLayoutAttrs(layout);
                }
              }
            }, 100);
          }
          if (action.type === "content/update") {
            const field = action.payload?.[1];
            if (window[pluginNamespace].functions.isLayoutField(field)) {
              for (const layout of field) {
                window[pluginNamespace].functions.addLayoutAttrs(layout);
              }
            }
          }
        },
      });
    }
  },
});
