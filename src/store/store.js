import {configureStore} from '@reduxjs/toolkit'
import groupSlice from './groupSlice';
import loginSlice from './loginSlice';
import contactSlice from './contactSlice';
import excelSlice from './excelSlice';

export const store = configureStore({
    reducer:{
        group:groupSlice,
        login:loginSlice,
        contact:contactSlice,
        excel:excelSlice,
    }
})