# Raksul Price Table assignment

## Source and status

This document is a requirements transcription supplied by the user, not a verbatim original assignment. No original assignment text document was attached. A mockup was attached and is visible in the conversation; its original image file is not accessible for copying into this repository.

Existing documentation was inspected before creating this document. The root `README.md` contains React, TypeScript, and Vite template documentation. No material conflicts with these requirements were found, and existing user content was preserved.

## Assignment

Build an interactive price table for paper printing products.

## Task 1 — Technical restrictions

- Use a JavaScript framework.
- Do not use utility libraries such as jQuery, Lodash, or Underscore.
- Do not use CSS frameworks such as Bootstrap or Foundation.
- Do not use UI component libraries.
- There are no prescribed colors or element dimensions.
- Support the latest Chrome or Firefox.

### Core functionality, in priority order

1. Display a table of prices by delivery business days × quantity.
2. Let users choose A4, A5, B4, or B5 and view the corresponding price table.

### Additional functionality

1. Clicking a price cell selects it. The selected cell stays highlighted, and its price appears in Order price.
2. Initially display five quantity rows. Clicking See more displays all available quantity rows.
3. Hovering over a price strongly highlights the cell and weakly highlights its corresponding row and column.

## Task 2 — Price formatting

- Write a function that inserts commas between groups of three digits, counted from the right.
- Write unit tests for the function.
- Prices are positive integers.
- Do not use `toLocaleString()` or `Intl.NumberFormat()`.
- A separate working environment is not required for Task 2.

## API

Request:

```http
GET https://us-central1-fe-ws-test.cloudfunctions.net/prices?paper_size=A4
```

- Query parameter: `paper_size`.
- Supported values: A4, A5, B4, B5.
- Values are case-insensitive.
- Default: A4.
- The response contains `paper_size` and `prices`.
- `prices` is a two-dimensional array with ten quantity rows.
- Rows are sorted by increasing quantity.
- Each price entry contains `business_day`, `price`, and `quantity`.

### Abbreviated response example

This example is abbreviated to two quantity rows with two entries each. The specified response has ten quantity rows.

```json
{
  "paper_size": "a5",
  "prices": [
    [
      { "business_day": 1, "price": 1000, "quantity": 10 },
      { "business_day": 2, "price": 900, "quantity": 10 }
    ],
    [
      { "business_day": 1, "price": 1500, "quantity": 100 },
      { "business_day": 2, "price": 1400, "quantity": 100 }
    ]
  ]
}
```

### Source discrepancy

The user reports that the original request example duplicated A5 in its list. This discrepancy is recorded without changing the explicit supported-values list: A4, A5, B4, B5.

The API description and example above are transcribed from the user-supplied requirements. The API was not fetched or independently verified.

## Mockup

- Contains a paper-size selector, Apply, Price table, Order price, and Cart.
- The written requirements do not specify the exact behavior of Apply or Cart.

Reference image status: missing from the repository. The attached mockup is visible in the conversation, but no accessible source image file or download resource was available to save under `docs/reference`. There is no saved image path to record. No substitute or empty image file was created; the original file format has not been verified.

## Implementation assumptions and unresolved decisions

No implementation assumptions are adopted by this transcription. Framework and tooling choices are separate from the assignment requirements above.

Apply and Cart behavior remains unspecified in the assignment requirements. The mockup alone does not establish when a paper-size change takes effect or what clicking Cart should do. Implementation assumptions, including the selected Apply behavior, are recorded separately in [`decisions.md`](decisions.md); they do not change the requirements above.
