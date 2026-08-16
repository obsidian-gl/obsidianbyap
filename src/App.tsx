/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CanvasBackground from './components/CanvasBackground';
import Home from './pages/Home';
import Projects from './pages/Projects';
import QrFerry from './pages/QrFerry';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <CanvasBackground />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/qr-ferry" element={<QrFerry />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
