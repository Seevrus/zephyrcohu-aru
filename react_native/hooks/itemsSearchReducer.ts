type SearchState = {
  searchTerm: string;
  barCode: string;
};

export enum SearchStateActionKind {
  SetSearchTerm = 'SetSearchTerm',
  SetBarCode = 'SetBarCode',
  ClearSearch = 'ClearSearch',
}

type SearchStateAction = {
  type: SearchStateActionKind;
  payload: string;
};

export default function itemsSearchReducer(_: SearchState, action: SearchStateAction): SearchState {
  switch (action.type) {
    case SearchStateActionKind.SetSearchTerm:
      return {
        searchTerm: action.payload,
        barCode: '',
      };
    case SearchStateActionKind.SetBarCode:
      return {
        searchTerm: '',
        barCode: action.payload,
      };
    case SearchStateActionKind.ClearSearch:
    default:
      return {
        searchTerm: '',
        barCode: '',
      };
  }
}
