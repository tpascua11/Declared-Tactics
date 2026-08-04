const ctx = require.context('.', true, /\.json$/);

export const DIALOG_REGISTRY = Object.fromEntries(
  ctx.keys().map(key => {
    const dialog = ctx(key);
    return [dialog.id, dialog];
  })
);
