import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logoff } from './store/loginSlice';
const { ipcRenderer } = window.require('electron');
const { app } = window.require('@electron/remote');

const Login = () => {
    const status = useSelector((state) => state.login.status);
    const dispatch = useDispatch();
    const [qr, setQr] = useState('');
    const loginButtonHandler = () => {
        console.log("button is clicked");
        ipcRenderer.send('login')
    }
    const logoutButtonHandler = () => {
        console.log("button is clicked");
        ipcRenderer.send('logout')
    }
    ipcRenderer.on('login', (event, data) => {
        console.log('Event ', event, ' Data ', data);
        setQr(data);
    })
    ipcRenderer.on('logout', (event, data) => {
        console.log('Log out Event ', event, ' Data ', data);
        if (data === 'success') {
            dispatch(logoff());
        } else {
            console.log("error in logging out ", data);
        }
    })
    const Qrcode = () => {
        if (qr == 'success') {
            dispatch(login());
            setQr('');
            return (<h1>Login successfully</h1>);
        } else {
            return (<QRCodeSVG value={qr} />);
        }
    }
    console.log('Store debug login status ', status);
    return (
        <div>
            <h1>login / logout</h1>
            {status ?
                <>
                    <button onClick={logoutButtonHandler}>Logout</button> 
                </>:
                <>
                    <button onClick={loginButtonHandler}>Login</button>
                    <hr></hr>
                    {qr !== '' && <Qrcode />}
                </>
            }
        </div>
    );
};

export default Login;