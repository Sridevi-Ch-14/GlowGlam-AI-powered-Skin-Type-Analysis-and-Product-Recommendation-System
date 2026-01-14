import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Manual from './pages/Manual'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="container">
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<Welcome/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/upload" element={<Upload/>} />
        <Route path="/manual" element={<Manual/>} />
        <Route path="/quiz" element={<Quiz/>} />
        <Route path="/results" element={<Results/>} />
      </Routes>
      {/* <Footer /> */}
    </div>
  )
}
