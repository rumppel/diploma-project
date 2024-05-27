import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import AlertComponent from './AlertComponent';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [city, setCity] = useState();
    const [telegram, setTelegram] = useState();
    const [showTelegram, setShowTelegram] = useState(false);
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z_]+$/;

    const [errorMessages, setErrorMessages] = useState([]);

    const fetchCityOptions = async (inputValue) => {
        try {
            const response = await axios.get(`${backendUrl}/cities?query=${inputValue}`);
            setCityOptions(response.data);
        } catch (error) {
            console.error('Error fetching city options:', error);
        }
    };

    useEffect(() => {
        // Функція, яка виконує запит до сервера для отримання списку міст
        const fetchCities = async () => {
            try {
                const response = await axios.get(`${backendUrl}/cities`);
                setCities(response.data);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities(); // Викликаємо функцію при монтуванні компонента
    }, []);

    const handleCityChange = (event) => {
        const { value } = event.target;
        setCity(value);
        fetchCityOptions(value);
        setShowTelegram(!!value); // Перевірка на пустий рядок
    };
    

    const handleSubmit = (event) => {
        const errors = [];

        if (!username) {
            errors.push('Please enter an username.');
        }

        if (!password) {
            errors.push('Please enter a password.');
        }

        if (!email) {
            errors.push('Please enter an e-mail.');
        } else if (!emailRegex.test(email)) {
            errors.push('Please enter a valid e-mail.');
        }

        if (!password) {
            errors.push('Please enter a password.');
        }

        if (city && !cityOptions.some((option) => option.name === city)) {
            errors.push('Please select a city from the list.');
        }

        if (telegram) {
            if (!usernamePattern.test(username)) {
                errors.push('Please enter a valid telegram: user_name.');
            }
        }

        setErrorMessages(errors);
        console.log(errors);
        // Якщо є помилки, не відправляти запит
        if (errors.length > 0) {
            return;
        }
        else{
        event.preventDefault();
        axios.get('/');
        axios.post( `${backendUrl}/register`, {username, email, password, city, telegram})
        .then(result => {
            if(result.data === "Already registered"){
                alert("E-mail or Username already registered! Please Login to proceed.");
                navigate('/login');
            }
            else{
                alert("Registered successfully! Please Login to proceed.")
                navigate('/login');
            }
            
        })
        .catch(err => console.log(err));
    }
    }

    return (
        <div>
            <AlertComponent errorMessages={errorMessages} />
            <div className="d-flex justify-content-center align-items-center text-center vh-100 mt-3" style= {{}}>
                <div className="bg-white p-3 mt-5 rounded col-10 col-sm-8 col-md-6 col-lg-4">
                    <h2 className='mt-5 mb-2 text-primary'>Sign up</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-2 text-start">
                            <label htmlFor="exampleInputEmail1" className="form-label">
                                <strong >Username</strong>
                            </label>
                            <input 
                                type="text"
                                placeholder="Enter Username"
                                className={`form-control ${errorMessages.includes('Please enter an username.') ? 'is-invalid' : ''}`}
                                id="inputname" 
                                onChange={(event) => setUsername(event.target.value)}
                                required
                            /> 
                        </div>
                        <div className="mb-2 text-start">
                            <label htmlFor="exampleInputEmail1" className="form-label">
                                <strong>Email</strong>
                            </label>
                            <input 
                                type="email" 
                                placeholder="Enter Email"
                                className={`form-control ${errorMessages.includes('Please enter an e-mail.') || errorMessages.includes('Please enter a valid e-mail.') ? 'is-invalid' : ''}`}
                                id="inputEmail" 
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            /> 
                        </div>
                        <div className="mb-2 text-start">
                            <label htmlFor="exampleInputPassword1" className="form-label">
                                <strong>Password</strong>
                            </label>
                            <input 
                                type="password" 
                                placeholder="Enter Password"
                                className={`form-control ${errorMessages.includes('Please enter a password.') ? 'is-invalid' : ''}`} 
                                id="inputPassword" 
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-2 text-start">
                            <label htmlFor="exampleInputCity" className="form-label">
                                <strong>City (optional)</strong>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter City"
                                className={`form-control ${errorMessages.includes('Please enter an e-mail.') || errorMessages.includes('Please select a city from the list.') ? 'is-invalid' : ''}`}
                                id="exampleInputCity"
                                list="cityOptions" // Пов'язуємо з ідентифікатором datalist
                                onChange={handleCityChange}
                                value={city}
                                autoComplete='off'
                            />
                            <datalist id="cityOptions">
                                {cityOptions.map((option, index) => (
                                    <option key={index} value={option.name} />
                                ))}
                            </datalist>

                            {cityOptions.length > 0 && (
                                <div className="dropdown">
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        {cityOptions.map((option, index) => (
                                            <li key={index} className="dropdown-item" onClick={() => setCity(option.name)}>
                                                {option.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {showTelegram && (
                            <div className="mb-2 text-start">
                            <label htmlFor="exampleInputPassword1" className="form-label">
                                <strong>Telegram (optional)</strong>
                            </label>
                            <input 
                                type="text" 
                                placeholder="user_name"
                                className={`form-control ${errorMessages.includes('Please enter a valid telegram: user_name.') ? 'is-invalid' : ''}`}
                                id="inputTelephone" 
                                onChange={(event) => setTelegram(event.target.value)}
                            />
                        </div>
                        )}
                        <button onClick={handleSubmit} type="button" className="btn btn-primary w-100">Sign Up</button>
                    </form>

                    <p className='container my-2'>Already have an account ?</p>
                    <Link to='/login' className="btn btn-secondary w-100">Log In</Link>
                </div>
            </div>
        </div>
    )
}

export default Register