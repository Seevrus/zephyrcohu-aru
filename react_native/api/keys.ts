export const queryKeys = {
  checkToken: ['check-token'],
  items: ['items'],
  otherItems: ['other-items'],
  partnerLists: ['partner-lists'],
  partners: ['partners'],
  priceLists: ['price-lists'],
  searchTaxNumber(...args: unknown[]) {
    return ['search-tax-number', ...args];
  },
  storeDetails(...args: unknown[]) {
    return ['store-details', ...args];
  },
  stores: ['stores'],
} as const;
