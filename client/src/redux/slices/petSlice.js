import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { fetchDashboardData } from './dashboardSlice';

export const fetchPets = createAsyncThunk(
  'pets/fetchPets',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/pets');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch pets';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getPetById = createAsyncThunk(
  'pets/getPetById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/pets/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch pet details';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addPet = createAsyncThunk(
  'pets/addPet',
  async (petData, thunkAPI) => {
    try {
      // petData could be FormData if there's an image
      const isFormData = petData instanceof FormData;
      
      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
      };
      
      const response = await api.post('/pets', petData, config);
      
      toast.success('Pet added successfully!');
      
      // Fetch updated dashboard data (like total pets)
      thunkAPI.dispatch(fetchDashboardData());
      
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to add pet';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updatePet = createAsyncThunk(
  'pets/updatePet',
  async ({ id, petData }, thunkAPI) => {
    try {
      const isFormData = petData instanceof FormData;
      
      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
      };
      
      const response = await api.put(`/pets/${id}`, petData, config);
      toast.success('Pet updated successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to update pet';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deletePet = createAsyncThunk(
  'pets/deletePet',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/pets/${id}`);
      toast.success('Pet deleted successfully!');
      
      // Fetch updated dashboard data
      thunkAPI.dispatch(fetchDashboardData());
      
      return id;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to delete pet';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  pets: [],
  selectedPet: null,
  loading: false,
  error: null,
  successMessage: null
};

const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearPetError: (state) => {
      state.error = null;
    },
    clearSelectedPet: (state) => {
      state.selectedPet = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all pets
      .addCase(fetchPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get single pet
      .addCase(getPetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPetById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPet = action.payload;
      })
      .addCase(getPetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add pet
      .addCase(addPet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets.unshift(action.payload); // Add to beginning of array
      })
      .addCase(addPet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update pet
      .addCase(updatePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.loading = false;
        // Update in array
        const index = state.pets.findIndex(pet => pet._id === action.payload._id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        state.selectedPet = action.payload;
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete pet
      .addCase(deletePet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = state.pets.filter(pet => pet._id !== action.payload);
        if (state.selectedPet && state.selectedPet._id === action.payload) {
          state.selectedPet = null;
        }
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPetError, clearSelectedPet } = petSlice.actions;
export default petSlice.reducer;
