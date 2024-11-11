import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// Definiujemy RootState jako typ stanu całej aplikacji
export type RootState = ReturnType<typeof store.getState>;

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
