import React, { useState, useEffect } from 'react'; // Додайте useState у імпорт

import axios from 'axios';
axios.defaults.withCredentials = true;
const CreateSession = () => {
  const [userData, setUser] = useState(null);
  const [districtOptions, setDistrictOptions] = useState([]);
  const cityName = 'Сир';
//   useEffect(() => {
//     axios.get('http://localhost:3001/create-sessionn', { withCredentials: true });
//   });
  //axios.get('http://localhost:3001/create-sessionn');

  // useEffect(() => {
  //   axios.get('http://localhost:3001/create-sessionn', { withCredentials: true })
  //     .then(result => {
  //       const userData = result.data.user;
  //       setUser(userData);
  //       console.log("IN HOME");
  //       console.log(userData);
  //     })
  //     .catch(err => console.log(err));
  // }, []);

  useEffect(() => {
    axios.get(`http://localhost:3001/neighborhood?query=${cityName}`)
      .then(result => {
        const userData = result.data;
        console.log("IN HOME");
        console.log(userData);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div style= {{backgroundColor: ""}} className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
        <h1>Create Session Page</h1>
        {userData ? <h2>{userData.username}</h2> : <p>Loading...</p>}
    </div>
  )
}

export default CreateSession