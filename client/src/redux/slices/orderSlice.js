import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { getCart } from './cartSlice';

export const createOrder = createAsyncThunk('orders/create', async (orderData, thunkAPI) => {
  try {
    const response = await api.post('/orders', orderData);
    thunkAPI.dispatch(getCart());
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getUserOrders = createAsyncThunk('orders/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getOrderById = createAsyncThunk('orders/getById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    isLoading: false,
    isError: false,
    message: ''
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserOrders.pending, (state) => { state.isLoading = true; })
      .addCase(getUserOrders.fulfilled, (state, action) => { state.isLoading = false; state.orders = action.payload; })
      .addCase(getOrderById.pending, (state) => { state.isLoading = true; })
      .addCase(getOrderById.fulfilled, (state, action) => { state.isLoading = false; state.currentOrder = action.payload; })
      .addCase(createOrder.fulfilled, (state, action) => { state.currentOrder = action.payload; });
  }
});

export default orderSlice.reducer;
