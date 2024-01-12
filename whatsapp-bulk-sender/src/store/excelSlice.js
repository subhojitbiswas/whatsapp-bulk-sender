import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    excel: "",
};

export const excelSlice = createSlice({
    name: 'excel',
    initialState,
    reducers: {
        load: (state, action) => {
            state.excel = action.payload;
        }
    }
})

export const { load } = excelSlice.actions;
export default excelSlice.reducer;