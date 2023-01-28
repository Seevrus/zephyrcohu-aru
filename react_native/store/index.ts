import { configureStore } from '@reduxjs/toolkit';
import { clientsReducer } from './clients-slice/clients-slice';

import { companyReducer } from './company-slice/company-slice';
import { configReducer } from './config-slice/config-slice';
import { productsReducer } from './products-slice/products-slice';
import { roundReducer } from './round-slice/round-slice';
import { roundsReducer } from './rounds-slice/rounds-slice';

const store = configureStore({
  reducer: {
    config: configReducer,
    company: companyReducer,
    clients: clientsReducer,
    rounds: roundsReducer,
    products: productsReducer,
    round: roundReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
