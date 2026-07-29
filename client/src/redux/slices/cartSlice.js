import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export const getCart = createAsyncThunk('cart/get', async (_, thunkAPI) => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, thunkAPI) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, thunkAPI) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: { items: [], total: 0, subtotal: 0 },
    isLoading: false,
    isError: false,
    message: ''
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => { state.isLoading = true; })
      .addCase(getCart.fulfilled, (state, action) => { state.isLoading = false; state.cart = action.payload; })
      .addCase(addToCart.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(removeCartItem.fulfilled, (state, action) => { state.cart = action.payload; });
  }
});

export default cartSlice.reducer;
