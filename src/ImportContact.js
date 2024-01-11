import React, { useState } from "react";
import * as XLSX from 'xlsx';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { load } from './store/excelSlice';

const { ipcRenderer } = window.require('electron');
const { app } = window.require('@electron/remote');

const allowedExtensions = ["csv", "xls", "xlsx"];
const styles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    height: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const ImportContact = () => {
    const excData = useSelector((state) => state.excel.excel);
    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const handleFileChange = (e) => {
        setError("");
        if (e.target.files.length) {
            const inputFile = e.target.files[0];
            console.log('inputFile ', inputFile);
            var re = /(?:\.([^.]+))?$/;
            const fileExtension = re.exec(inputFile.name)[1];
            console.log('extension ', fileExtension);
            if (!allowedExtensions.includes(fileExtension)) {
                setError("Please input a excel file");
                return;
            }
            fileParse(inputFile);
        }
    };
    const fileParse = async (file) => {
        if (!file) return setError("Enter a valid file");
        const reader = new FileReader();
        reader.onload = (e) => {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, { type: 'array' });
            console.log('workbook ', workbook);
            let jsonData;
            workbook.SheetNames.forEach((sheetName) => {
                if (sheetName === "Sheet1") {
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                }
            });
            console.log('jsonData ', jsonData);
            ipcRenderer.send('import', jsonData);
        };
        reader.readAsArrayBuffer(file);
    };
    ipcRenderer.on('import', (event, dt) => {
        dt = dt.map((ele) => {
            return {
                'number': (ele.number[0] + '' + ele.number[1]),
                'state': ele.state ? 'Yes' : 'No'
            };
        })
        console.log('ipc received ', dt);
        dispatch(load(dt));
    })
    const col = [
        { "field": "number", "headerName": "Number", width: 250, minWidth: 200, maxWidth: 300 },
        { "field": "state", "headerName": "Available in whatsapp", width: 125, minWidth: 150, maxWidth: 200 },
    ]
    return (
        <div>
            <label htmlFor="csvInput" style={{ display: "block" }}>
                Enter excel File
            </label>
            <input
                onChange={handleFileChange}
                id="csvInput"
                name="file"
                type="File"
            />
            <h1>{error}</h1>
            {console.log('printing rows', excData)}
            {excData && excData !== "" &&
                // <Box sx={styles}>
                    <DataGrid
                        columns={col}
                        rows={excData}
                        checkboxSelection
                        onRowSelectionModelChange={(e) => console.log('select event ', e)}
                        getRowId={(row) => row.number}
                    />
                // </Box>
            }
            <hr></hr>
        </div>
    );
};

export default ImportContact;