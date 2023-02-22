import { configureStore } from '@reduxjs/toolkit';

import { agentsReducer } from './agents-slice/agents-slice';
import { configReducer } from './config-slice/config-slice';
import { itemsReducer } from './items-slice/items-slice';
import { partnersReducer } from './partners-slice/partners-slice';
import { roundReducer } from './round-slice/round-slice';
import { storeListReducer } from './store-list-slice/store-list-slice';
import { storeReducer } from './store-slice/store-slice';

const store = configureStore({
  reducer: {
    config: configReducer,
    agents: agentsReducer,
    partners: partnersReducer,
    storeList: storeListReducer,
    store: storeReducer,
    items: itemsReducer,
    round: roundReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
