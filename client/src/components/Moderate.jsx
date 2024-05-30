import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import ModerateUsers from './ModerateUsers';
import ModeratePoints from './ModeratePoints';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const Moderate = () => {
    const [showUsers, setShowUsers] = useState(true);
    const [userData, setUser] = useState(null);
    const handleSwitch = () => {
        setShowUsers(prevShowUsers => !prevShowUsers);
    };

    useEffect(() => {
        axios.get(`${backendUrl}/getsession`, { withCredentials: true })
            .then(result => {
                const userData = result.data;
                setUser(userData);
            })
            .catch(err => console.log(err));
    }, []);

    return (
        <Container className="mt-5 page-content">
            {userData ? 
            <>
            <div className="mb-3 pt-4">
                <Button variant="primary" className="mr-2" onClick={handleSwitch}>
                    {showUsers ? 'Switch to Points' : 'Switch to Users'}
                </Button>
            </div>
            {showUsers ? <ModerateUsers /> : <ModeratePoints />}</>
            : <div className="mb-3 pt-4 text-center">
            <h2>You are not allowed to moderate</h2>
          </div>}
        </Container>
    );
};

export default Moderate;
