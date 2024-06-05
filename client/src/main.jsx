import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import './scss/custom.scss';
import Header from './components/Header';
import UserProvider from './components/UserProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <Header />
    <App />
    {/* <Footer /> */}
  </UserProvider>
);

