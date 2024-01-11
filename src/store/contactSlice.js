import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    contact: "",
};

export const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {
        load: (state, action) => {
            state.contact = action.payload;
        }
    }
})

export const { load } = contactSlice.actions;
export default contactSlice.reducer;