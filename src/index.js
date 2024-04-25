const pluginNamespace = "volkmann-design-code/kirby-layout-attributes";

window[pluginNamespace] = window[pluginNamespace] ?? {};
window[pluginNamespace].functions = window[pluginNamespace].functions ?? {};
window[pluginNamespace].functions.isLayoutField = (field) => {
  return (
    Array.isArray(field) &&
    field.length > 0 &&
    field.every(
      (entry) =>
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
  }
};

window.panel.plugin("volkmann-design-code/kirby-layout-attributes", {
  created(Vue) {
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
  },
});
