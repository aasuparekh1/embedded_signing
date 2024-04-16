import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OAuthResponseHandler from './component/OAuthResponseHandler';
import DsResponseHandler from './component/DsResponseHandler';
import Mainpage from './component/Mainpage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route
          path="/oauth-response-handler"
          element={<OAuthResponseHandler />}
        />
        <Route path="/ds-response-handler" element={<DsResponseHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
