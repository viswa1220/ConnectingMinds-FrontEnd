// appStore.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
// Create a root reducer (even if it's just one slice)
const rootReducer = combineReducers({
  user: userReducer,
});

// Define persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], 
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store using the persisted reducer
const appStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// Create a persistor linked to the store
export const persistor = persistStore(appStore);

export default appStore;
