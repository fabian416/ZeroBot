import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';


function App() {
  return (
    <div className="min-h-screen flex flex-col">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
    </div>
  );
}

export default App;