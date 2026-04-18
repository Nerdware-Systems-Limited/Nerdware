import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authslice';
import usersReducer from './slices/userSlice';
import blogReducer from './slices/Blogslice';
import portfolioReducer from './slices/portfolioSlice';
import testimonialReducer from './slices/testimonialSlice';
import applicationsReducer from './slices/applicationsSlice';
import miscReducer from './slices/miscSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    users:        usersReducer,
    blogs:        blogReducer,
    portfolios:   portfolioReducer,
    testimonials: testimonialReducer,
    applications: applicationsReducer,
    misc:         miscReducer,
  },
});