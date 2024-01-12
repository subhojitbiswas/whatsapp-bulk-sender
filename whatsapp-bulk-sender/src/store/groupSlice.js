import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    group: "",
};

export const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        load: (state, action) => {
            state.group = action.payload;
        }
    }
})

export const { load } = groupSlice.actions;
export default groupSlice.reducer;