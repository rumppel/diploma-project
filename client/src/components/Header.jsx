import { Navbar, Nav, NavDropdown, Button, Form, FormControl } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Header = () => {
    const [userData, setUser] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        if (!userData) {
        axios.get(`${backendUrl}/getsession`, { withCredentials: true })
            .then(result => {
                const userData = result.data;
                setUser(userData);
            })
            .catch(err => console.log(err));
        }
    }, []);

    const logout = (event) => {
        event.preventDefault();

        axios.post(`${backendUrl}/logout`)
            .then(result => {
                if (result.data.message === 'Logged out successfully') {
                    alert('Logged out successfully');
                    setUser(null);
                    window.location.replace('/home');
                }
                else {
                    alert('Unsuccessfully');
                }
            })
            .catch(err => console.log(err));
    }

    return (
        
        <Navbar className='fixed-top' bg="light" expand="lg" style={{paddingLeft:'25px',paddingRight:'25px'}}>
            <Navbar.Brand href="/home"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 40 40">
                <path fill="#dff0fe" d="M7,36.768V14H2.5v15.722C2.5,32.845,4.345,35.531,7,36.768z"></path><path fill="#dff0fe" d="M3.064,7.38C4.394,8.028,7,9,7,9S6.529,5.44,6.227,3.648C4.809,4.516,3.691,5.821,3.064,7.38z"></path><path fill="#dff0fe" d="M15,37.5h14.722c0.265,0,0.526-0.014,0.784-0.04C27.535,35.128,15,26,15,26V37.5z"></path><path fill="#4788c7" d="M14,2h2v17h-2V2z"></path><path fill="#98ccfd" d="M2.5,18.045L5.25,20h0.01L6,20.53l1,0.72l1,0.71L8.06,22l1.73,1.23L12.28,25l0.81,0.58L14,26.22	l1,0.71l1,0.72l0.66,0.46l6.36,4.52c0,0.01,0.01,0.01,0.01,0.01l4.5,3.2c0,0,0,0.01,0.01,0.01l2.309,1.644	c3.932-0.063,7.151-3.04,7.595-6.868L35.97,29.58l-0.98-0.7l-2.66-1.89l-1.6-1.14L16,15.38v-0.01l-0.45-0.32L15,14.66l-1-0.71	L9,10.4L8,9.69L6,8.27L3.49,6.486C2.862,7.608,2.5,8.9,2.5,10.278V18.045z"></path><path fill="#98ccfd" d="M38,21l-0.5,10.13c0,0.36-0.216,0.605-0.216,0.605L16,16.6V2h3C19,12.48,27.52,21,38,21z"></path><rect width="2" height="10" x="14" y="28" fill="#b6dcfe"></rect><path fill="#b6dcfe" d="M8,10c0,0,0.183-5.216,0.105-7.186C7.35,3.033,6.641,3.362,6,3.785V10H8z"></path><path fill="#98ccfd" d="M8,29v7.94c-0.34-0.04-0.68-0.11-1-0.21c-0.35-0.09-0.68-0.21-1-0.37V28L8,29z"></path><path fill="#fff" d="M15,2.61v34.839H8.87c-0.3,0-0.59-0.02-0.87-0.06c-0.34-0.04-0.68-0.11-1-0.21V2.88	c0.32-0.1,0.66-0.17,1-0.2c0.28-0.05,0.57-0.07,0.87-0.07H15z"></path><path fill="#b6dcfe" d="M2.5,16.825l3.39,2.405L6,19.31l1,0.71l1,0.71l1,0.72l1.15,0.81l2.31,1.65h0.01L14,25l1,0.71l1,0.71	l1.19,0.85l5.07,3.6l1.51,1.08c0.01,0.01,0.01,0.01,0.01,0.01l4.15,2.94l1.49,1.08c0.01,0.01,0.01,0.01,0.02,0l1.901,1.349	c2.874-0.609,5.154-2.806,5.896-5.629l-1.446-1.03l-0.88-0.63l-4.6-3.26c-0.01,0-0.01-0.01-0.01-0.01l-1.89-1.35L16,16.61V16.6	l-1-0.71l-1-0.71l-5-3.55l-2-1.42L6,9.5L3.054,7.406C2.7,8.295,2.5,9.262,2.5,10.278V16.825z"></path><path fill="#98ccfd" d="M14,2.546V19H8V2.598c0.28-0.037,0.57-0.052,0.87-0.052H14z"></path><path fill="#4788c7" d="M34.77,25.04c0,0-0.77,0.96-2.77,0.96s-3-1-3-1s-1,1-3,1s-2.77-0.96-2.77-0.96	C22.45,26.16,22,27.53,22,29c0,3.87,3.13,7,7,7s7-3.13,7-7C36,27.53,35.55,26.16,34.77,25.04z"></path><path fill="#98ccfd" d="M34,29H24c0-0.42,0.05-0.83,0.15-1.23C24.72,27.92,25.34,28,26,28c1.28,0,2.29-0.31,3-0.64	c0.71,0.33,1.72,0.64,3,0.64c0.66,0,1.28-0.08,1.85-0.23C33.95,28.17,34,28.58,34,29z"></path><path fill="#98ccfd" d="M6,8.27V9.5v11.03l1,0.72V10.21V8.98L6,8.27z M16,15.38v12.27l-1-0.72V14.66L16,15.38z"></path><path fill="#4788c7" d="M11,17c-3.866,0-7,3.134-7,7s3.134,7,7,7s7-3.134,7-7S14.866,17,11,17z"></path><path fill="#98ccfd" d="M6,8.27V9.5l1,0.71V8.98L6,8.27z M15,14.66v1.23l1,0.71v-1.23L15,14.66z"></path><path fill="#b6dcfe" d="M38,12.96V22c-11.03,0-20-8.97-20-20h9.04C27.52,7.83,32.17,12.48,38,12.96z"></path><path fill="#4788c7" d="M38,11.085v2.875C31.62,13.48,26.52,8.38,26.05,2h2.865C33.932,2,38,6.068,38,11.085z"></path><path fill="#98ccfd" d="M38,11.252v1.708C32.17,12.48,27.52,7.83,27.04,2h1.708C33.858,2,38,6.142,38,11.252z"></path><path fill="#4788c7" d="M19,2h-1c0,11.03,8.97,20,20,20v-1C27.52,21,19,12.48,19,2z"></path><path fill="#fafafa" d="M11,20l-3,8l3-2l3,2L11,20z"></path><path fill="#fff" d="M34.45,26.48C33.88,26.76,33.08,27,32,27c-1.39,0-2.39-0.41-3-0.77C28.39,26.59,27.39,27,26,27 c-1.08,0-1.88-0.24-2.45-0.52C23.19,27.26,23,28.11,23,29c0,3.31,2.69,6,6,6c3.31,0,6-2.69,6-6C35,28.11,34.81,27.26,34.45,26.48z M29,34c-2.415,0-4.434-1.721-4.899-4h9.798C33.434,32.279,31.415,34,29,34z M24,29c0-0.422,0.051-0.834,0.151-1.233 C24.724,27.922,25.343,28,26,28c1.283,0,2.288-0.308,3-0.641C29.712,27.692,30.717,28,32,28c0.657,0,1.276-0.078,1.849-0.233 C33.949,28.166,34,28.578,34,29H24z"></path><path fill="#fff" d="M28.125,31.24c0,0,0-0.625-0.625-0.625s-0.625,0.625-0.625,0.625h0.375 c0-0.114,0.043-0.25,0.25-0.25c0.066,0,0.242,0,0.25,0.25c0,0.215-0.291,0.549-0.487,0.707l-0.013,0.01l-0.375,0.325v0.036v0.298 h1.25V32.24h-0.628C27.497,32.24,28.125,31.74,28.125,31.24z M29.4,31.615c0.125-0.102,0.225-0.243,0.225-0.427 c0-0.316-0.28-0.573-0.625-0.573s-0.625,0.257-0.625,0.573c0,0.184,0.1,0.325,0.225,0.427c-0.125,0.102-0.225,0.243-0.225,0.427 c0,0.316,0.28,0.573,0.625,0.573s0.625-0.257,0.625-0.573C29.625,31.858,29.525,31.717,29.4,31.615z M29,30.99 c0.135,0,0.25,0.091,0.25,0.198c0,0.106-0.157,0.19-0.25,0.228c-0.092-0.037-0.25-0.121-0.25-0.228 C28.75,31.079,28.862,30.99,29,30.99z M29,32.24c-0.138,0-0.25-0.089-0.25-0.198c0-0.106,0.157-0.19,0.25-0.228 c0.092,0.037,0.25,0.121,0.25,0.228C29.25,32.149,29.135,32.24,29,32.24z M30.499,30.99c0.104,0,0.138,0.033,0.163,0.067 c0.057,0.075,0.087,0.207,0.087,0.382v0.354c0,0.175-0.03,0.307-0.086,0.381c-0.026,0.034-0.06,0.067-0.162,0.067 c-0.105,0-0.139-0.033-0.165-0.067c-0.057-0.075-0.087-0.206-0.087-0.38v-0.355c0-0.175,0.03-0.307,0.086-0.381 C30.362,31.023,30.396,30.99,30.499,30.99 M30.499,30.615c-0.199,0-0.352,0.071-0.461,0.214s-0.163,0.346-0.163,0.608v0.355 c0,0.261,0.055,0.463,0.164,0.607c0.109,0.144,0.264,0.215,0.463,0.215c0.198,0,0.351-0.071,0.46-0.214 c0.109-0.143,0.163-0.346,0.163-0.608v-0.354c0-0.262-0.055-0.465-0.164-0.608C30.852,30.687,30.698,30.615,30.499,30.615 L30.499,30.615z"></path><g><path fill="#4788c7" d="M30,3c3.86,0,7,3.14,7,7v20c0,3.86-3.14,7-7,7H10c-3.86,0-7-3.14-7-7V10c0-3.86,3.14-7,7-7H30 M30,2 H10c-4.418,0-8,3.582-8,8v20c0,4.418,3.582,8,8,8h20c4.418,0,8-3.582,8-8V10C38,5.582,34.418,2,30,2L30,2z"></path></g>
            </svg></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="/map">Map</Nav.Link>
                    <Nav.Link href="/howtohelp">How to help?</Nav.Link>
                    {/* <Nav.Link href="/news">Last news</Nav.Link> */}
                    <Nav.Link href="/statistics">Statistics</Nav.Link>
                    {userData && userData.role === 'moderator' ?
                    <Nav.Link href="/moderate">Moderate</Nav.Link>
                    :
                    null
                    }
                    
                    {userData && userData.role === 'user' ?
                    <Nav.Link href="/subscribe">Subscribe for updates</Nav.Link>
                    :
                    null
                    }
                    
                </Nav>
                <Nav className="ms-auto">
                    {userData ?
                        <NavDropdown align="end" className='my-dropdown-toggle' title={userData.username} id="basic-nav-dropdown">
                            <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                            <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
                        </NavDropdown>

                        : <Button href='/login' variant="outline-primary" className="ml-2">Log in/Sign up</Button>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
