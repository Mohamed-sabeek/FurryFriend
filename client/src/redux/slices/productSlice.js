import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export const getProducts = createAsyncThunk('products/getAll', async (query, thunkAPI) => {
  try {
    const qString = query ? `?${new URLSearchParams(query).toString()}` : '';
    const response = await api.get(`/products${qString}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getProductDetails = createAsyncThunk('products/getDetails', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getRecommendedProducts = createAsyncThunk('products/getRecommended', async (petId, thunkAPI) => {
  try {
    const response = await api.get(`/products/recommended/${petId}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  products: [],
  product: null,
  recommendedProducts: [],
  recommendationReason: '',
  isLoading: false,
  isError: false,
  message: ''
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => { state.isLoading = true; })
      .addCase(getProducts.fulfilled, (state, action) => { state.isLoading = false; state.products = action.payload; })
      .addCase(getProducts.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(getProductDetails.pending, (state) => { state.isLoading = true; })
      .addCase(getProductDetails.fulfilled, (state, action) => { state.isLoading = false; state.product = action.payload; })
      .addCase(getProductDetails.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(getRecommendedProducts.pending, (state) => { state.isLoading = true; })
      .addCase(getRecommendedProducts.fulfilled, (state, action) => { state.isLoading = false; state.recommendedProducts = action.payload.recommended; state.recommendationReason = action.payload.reason; })
      .addCase(getRecommendedProducts.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
  }
});

export default productSlice.reducer;
