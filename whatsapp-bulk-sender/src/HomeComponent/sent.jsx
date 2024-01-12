import React, { useState } from 'react';

const { ipcRenderer } = window.require('electron');


const Sent = () => {
    const [message, setMessage] = useState("");
    const [caption, setCaption] = useState("");
    const [buttonList, setButtonList] = useState([]);
    const [file, setFile] = useState("");
    const [tempMobile,setTempMobile] = useState("");
    const sendMessage = () => {
        ipcRenderer.send('sendMessage', { number: ['919123979763',tempMobile], message: message, button: buttonList, file: file, caption:caption });
    }

    ipcRenderer.on('sendMessage', (event, dt) => {
        console.log("sendMessage status ", dt);
    })


    const allowedExtensions = ["pdf", "jpg", "jpeg", "gif", "png"];

    const handleFileChange = (e) => {
        if (e.target.files.length) {
            const inputFile = e.target.files[0];
            console.log('inputFile ', inputFile);
            setFile(inputFile.path);            
        }
    };


    return (
        <div>
            <label>Enter message to be sent</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} cols={50} rows={10} />
            {/* <ul>
                {buttonList.map((ele, ind) => {
                    return (
                        <li key={ind}>
                            <input type='text' value={ele.text} onChange={(e) => {
                                let prev = [...buttonList];
                                prev[ind] = e.target.value;
                                setButtonList(prev);
                            }} />
                            <span>
                                <button onClick={() => setButtonList(buttonList.filter((_, i) => i !== ind))}>(-)</button>
                            </span>
                        </li>
                    )
                })}
            </ul> */}
            {/* <label>Enter button details</label>
            <input type='text' value={but} onChange={(e) => setBut(e.target.value)} /> */}
            {/* <button onClick={() => setButtonList(prev => [...prev, ""])}>Add more buttons</button> */}
            <br />
            <label>Input attachment</label>
            <br />
            <input
                onChange={handleFileChange}
                id="csvInput"
                name="file"
                type="File"
            />
            <br />
            <label>Caption for the attachment</label>
            <br />
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} cols={50} rows={10} />
            <br />
            <button onClick={sendMessage}>Send message</button>
            <label>Enter temporary mobile number</label>
            <input type='text' placeholder='Enter full mobile number with 91' onChange={(e)=>setTempMobile(e.target.value)} />

        </div>
    );
};

export default Sent;