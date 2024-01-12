import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    status: false,
};

export const loginSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {
        login: (state, action) => {
            console.log('called login');
            state.status = true;
        },
        logoff: (state) => {
            console.log('called logoff');
            state.status = false;
        }
    }
})

export const { login,logoff } = loginSlice.actions;
export default loginSlice.reducer;