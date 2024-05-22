
import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react'; // Додайте useState у імпорт
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import backgroundImage from '../images/UkraineMapScreen5.png';

const Home = () => {
  const [userData, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get('http://localhost:3001/getsession', { withCredentials: true })
      .then(result => {
        const userData = result.data;
        setUser(userData);
      })
      .catch(err => console.log(err));
  }, []);

  
  const logout = (event) => {
    event.preventDefault();
    
    axios.post( 'http://localhost:3001/logout')
    .then(result => {
        if(result.data.message === 'Logged out successfully'){
            alert('Logged out successfully');
            setUser(null);
            //history.push('/login');
            window.location.replace('/home');
        }
        else{
            alert('Unsuccessfully');
        }
    })
    .catch(err => console.log(err));
}

  return (
    <div className="page-content" style={{ backgroundColor: '#f7f7f7',backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
    <div className="container" style={{ height: '99.4vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="text-center" style={{backgroundColor: 'rgba(192, 192, 192, 0.48)', padding: '15px', zIndex: '1', width: "80%", height: "60%"}}>
        <h1 className="mb-5">Interactive map with evidence of russian aggresion during the russo-Ukrainian war</h1>
        <div style={{ position: 'absolute', top: '63%', left: "0%", width: "100%"}}>
        <div>
          <Link to="/map" className="btn btn-primary mr-2 w-25">View map</Link>
        </div>
        <div className="mt-3">
          {userData ?
            <Link onClick={logout} className="btn btn-outline-primary w-25">Log out</Link>
            :
            <Link to="/login" className="btn btn-outline-primary w-25">Log in/Sign in</Link>
          }
        </div>
        </div>
      </div>
      <div className="overlay-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '10px', borderRadius: '5px' }}>
        <p className="hashtag" style={{ fontSize: '130px', fontWeight: 'bold'}}>#RussiaIsATerroristState</p>
      </div>
    </div>

    </div>
  )
}

export default Home