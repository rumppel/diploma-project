import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
//import Footer from './components/Footer'
import './scss/custom.scss';
import Header from './components/Header';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <Header/>
    <App/>
    {/* <Footer/> */}
  </React.Fragment>
)
