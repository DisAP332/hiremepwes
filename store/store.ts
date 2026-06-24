import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "@/store/bookingSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      bookingWizard: bookingReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
