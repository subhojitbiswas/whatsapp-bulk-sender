import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logoff } from './store/loginSlice';

const Login = () => {
    const status = useSelector((state) => state.login.status);
    const dispatch = useDispatch();
    const [qr, setQr] = useState('');
    const loginButtonHandler = () => {
        console.log("login button is clicked");
        window.api.login();
    }
    const logoutButtonHandler = async () => {
        console.log("logout button is clicked");
        let value = await window.api.logout();
        if (value === 'success') {
            dispatch(logoff());
        } else {
            console.log("error in logging out ", value);
        }
    }
    window.api.loginQr((event, value) => {
        console.log('Event ', event, ' value ', value);
        setQr(value);
    })
    window.api.disconnected((event, value) => {
        dispatch(logoff());
        console.log('Log out Event ', event, ' value ', value);        
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