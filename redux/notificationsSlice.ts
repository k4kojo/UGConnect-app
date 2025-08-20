import {
  fetchNotifications as fetchNotificationsApi,
  markNotificationRead,
  NotificationItem,
} from "@/services/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationsState = {
  items: NotificationItem[];
  isLoading: boolean;
  error: string | null;
};

const initialState: NotificationsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const data = await fetchNotificationsApi();
    return data;
  }
);

export const readNotification = createAsyncThunk(
  "notifications/read",
  async (id: number) => {
    await markNotificationRead(id);
    return id;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<NotificationItem[]>) => {
          state.isLoading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load notifications";
      })
      .addCase(readNotification.fulfilled, (state, action: PayloadAction<number>) => {
        const id = action.payload;
        const idx = state.items.findIndex((n) => Number(n.id) === Number(id));
        if (idx >= 0) state.items[idx].isRead = true;
      });
  },
});

export default notificationsSlice.reducer;


