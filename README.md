# ACQS Knowledge Portal

This repository contains a static, client-side knowledge portal for the SCB ACQS function catalogue. It is designed for GitHub Pages or local/offline use and does not require a backend. Keep the repository private whenever the linked source documents contain internal SCB information.

## How to use

- Open `index.html` directly, or publish the repository with GitHub Pages.
- Use the overview folders or the search box to find a function by title, ID, category, priority, status or E2E reference.
- Open a result to see its metadata, current source path and version history.
- The original E2E mapping remains at `reference/E2E_Full_Function_Mapping.html`.

## Adding documents and versions

The catalogue lives in [`data.js`](data.js), separated from the presentation and behaviour:

```js
{
  id: 'I01',
  name: 'Example function',
  category: 'Integration',
  priority: 'P1',
  status: 'drafting',
  updated: '2026-09-12',
  path: 'functions/integration/I01-example-function.md',
  versions: [
    { label: 'Current', date: '2026-09-12', path: 'functions/integration/I01-example-function.md' },
    { label: 'v0.1', date: '2026-08-20', path: 'archive/I01-example-function-v0.1.md' }
  ]
}
```

The current MVP renders the recorded `updated`/`path` pair and will show any older versions added to the data record as the index grows. Keep document text in the referenced private files; do not paste sensitive content into the portal UI.

Binary references such as spreadsheets can be stored under `documents/` and linked in exactly the same way. The supplied downstream workbook is preserved at `documents/downstream/Summary-Downstream-v1.0-20260707.xlsx`.

## Validation

The portal has no build step. Basic validation can be run with:

```bash
node --check app.js
node --check data.js
```
