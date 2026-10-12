# Bagsy ML: the item sorter

**Goal:** when someone adds their own item ("sunnies", "type c cable", "aadhaar card"),
put it in the right category automatically: clothing, toiletries, electronics, documents or misc.

This is a **text classification** problem: the input is a short piece of text, the output is one of 5 labels.

## Plan
1. **Dataset** (this step): collect labelled examples in `data/`.
2. **Train**: turn text into numbers (TF-IDF) and train a simple model (logistic regression) with scikit-learn.
3. **Evaluate**: test on items the model has never seen and measure accuracy.
4. **Ship**: export the model so the Node server can use it when you add an item.

## The data
| File | Where it came from |
|---|---|
| `data/rule_items.csv` | Every item in the packing rules. Made by `node ml/scripts/export_rule_items.js` |
| `data/handmade_items.csv` | Everyday, messy ways people actually type items: slang, typos, brands, Indian items |

Columns: `item` (the text), `category` (the label), `source` (where it came from).

## Labelling guide
Labels must be consistent, or the model learns nonsense. Use these rules:

- **clothing**: anything you *wear*: clothes, shoes, swimwear, hats, belts
- **toiletries**: things for your *body*: hygiene, skincare, hair, makeup, period products, medicine, contact lenses
- **electronics**: anything that *needs power or a cable*, including chargers and hair tools
- **documents**: proof of who you are, money, tickets and bookings, printed or saved
- **misc**: everything else: bags, bottles, snacks, books, locks, sunglasses and glasses

### Tricky ones (decide once, then stick to it)
- *Electric toothbrush*: needs charging, so **electronics**
- *Doctor's prescription*: a piece of paper you show, so **documents** (the medicine itself is toiletries)
- *First aid kit*: the rules say **misc**, so we keep misc
- *Sunglasses / specs*: the rules say **misc**
