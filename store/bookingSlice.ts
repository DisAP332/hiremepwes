import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ServiceCategory } from "@/lib/validators";

type BookingWizardState = {
  step: number;
  selectedCategory: ServiceCategory | null;
  uploadedPhotoUrls: string[];
};

const initialState: BookingWizardState = {
  step: 0,
  selectedCategory: null,
  uploadedPhotoUrls: [],
};

const bookingSlice = createSlice({
  name: "bookingWizard",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<ServiceCategory>) {
      state.selectedCategory = action.payload;
    },
    addUploadedPhotoUrl(state, action: PayloadAction<string>) {
      state.uploadedPhotoUrls.push(action.payload);
    },
    removeUploadedPhotoUrl(state, action: PayloadAction<string>) {
      state.uploadedPhotoUrls = state.uploadedPhotoUrls.filter((url) => url !== action.payload);
    },
    resetBookingWizard() {
      return initialState;
    },
  },
});

export const {
  setStep,
  setSelectedCategory,
  addUploadedPhotoUrl,
  removeUploadedPhotoUrl,
  resetBookingWizard,
} = bookingSlice.actions;

export default bookingSlice.reducer;
