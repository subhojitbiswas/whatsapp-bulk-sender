import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { load } from './store/contactSlice';


const { ipcRenderer } = window.require('electron');
const { app } = window.require('@electron/remote');

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

const Contact = () => {
    const cntData = useSelector((state) => state.contact.contact);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const contactButtonHandler = () => {
        console.log('Contact button is clicked');
        if (cntData === "")
            ipcRenderer.send('contact');
        else
            setOpen(true);
    }
    ipcRenderer.on('contact', (event, dt) => {
        console.log(dt);
        let temp = dt.filter((flt) => flt.id.user.length == 12).map((dt2) => {
            return { "name": dt2.name, "no": dt2.id.user };
        })
        dispatch(load(JSON.parse(JSON.stringify(temp))));
        // setData(JSON.parse(JSON.stringify(temp)));
        setOpen(true);
    })
    const handleClose = () => {
        setOpen(false);
    }
    const handleOpen = () => {
        setOpen(true);
    }
    const col = [
        { "field": "name", "headerName": "Name", width: 250, minWidth: 200, maxWidth: 300 },
        { "field": "no", "headerName": "Contact Number", width: 125, minWidth: 150, maxWidth: 200 },
    ]
    return (
        <div>
            <h1>contact</h1>
            <button onClick={contactButtonHandler}>Contact</button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="Contact save in your Whatsapp"
            >
                <Box sx={styles}>
                    <DataGrid
                        columns={col}
                        rows={cntData}
                        checkboxSelection
                        onRowSelectionModelChange={(e) => console.log('select event ', e)}
                        getRowId={(row) => row.name + row.no}
                    />
                </Box>
            </Modal>
            <hr></hr>
        </div>
    );
};

export default Contact;