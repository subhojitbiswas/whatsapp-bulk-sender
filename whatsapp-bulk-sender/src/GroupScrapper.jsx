import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { load } from './store/groupSlice';


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
    overflow: "hidden",
    overflowY: "scroll",
};

const GroupScrapper = () => {
    const grpData = useSelector((state) => state.group.group);
    const dispatch = useDispatch();
    // const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const groupButtonHandler = () => {
        if (grpData === "")
            ipcRenderer.send('group')
        else
            setOpen(true);
    }
    ipcRenderer.on('group', (event, dt) => {
        console.log('Event ', event, ' Data ', dt);
        dispatch(load(JSON.parse(JSON.stringify(dt))));
        // setData(JSON.parse(JSON.stringify(dt)));
        setOpen(true);
    })
    const handleClose = () => {
        setOpen(false);
    }
    const handleOpen = () => {
        setOpen(true);
    }
    const col = [
        { "field": "no", "headerName": "Contact Number", width: 125, minWidth: 150, maxWidth: 200 },
    ]
    const checkboxHandler = (ind, ind2) => {

    }
    return (
        <div>
            <h1>group</h1>
            <button onClick={groupButtonHandler}>Group</button>
            {console.log('Debug modal open ', open, ' grp ', grpData)}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="Your whatsapp group"
            >
                <Box sx={styles}>
                    {grpData !== "" && grpData.map((dt, ind) => {
                        return (
                            <Accordion key={ind}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <h3>{dt.grpName}</h3>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {dt.participants.map((dt2, ind2) => {
                                        return (
                                            <>
                                                <label>{dt2.id.user}</label>
                                                <input key={ind2} type='checkbox' checked={true} value={dt2.id.user} onChange={() => checkboxHandler(ind, ind2)} />
                                            </>
                                        )
                                    })}
                                </AccordionDetails>
                            </Accordion>
                        )
                    })}
                </Box>
            </Modal>
            <hr></hr>
        </div>
    );
};

export default GroupScrapper;