import React from 'react';
import Login from './Login';
import GroupScrapper from './GroupScrapper';
import Contact from './Contact';
import ImportContact from './ImportContact';
import Sent from './HomeComponent/sent';
import { useSelector } from 'react-redux';
import { NavLink, Route, Routes } from 'react-router-dom';

const Home = () => {
    const status = useSelector((state) => state.login.status);
    // const status = true;
    const Navbar = () => {
        return (
            <nav>
                <ul>
                    <li>
                        <NavLink to="/groupScrapper">GroupScrapper</NavLink>
                    </li>
                    <li>
                        <NavLink to="/importContact">ImportContact</NavLink>
                    </li>
                    <li>
                        <NavLink to="/contact">Contact</NavLink>
                    </li>
                    <li>
                        <NavLink to="/sent">Sent</NavLink>
                    </li>
                </ul>
            </nav>
        )
    }
    return (
        <div>
            <Login />
            {status &&
                <Navbar />
            }
            {status && <Routes>
                <Route path="/groupScrapper" element={<GroupScrapper />} />
                <Route path="/importContact" element={<ImportContact />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/sent" element={<Sent />} />
            </Routes>
            }
        </div>
    );
};

export default Home;