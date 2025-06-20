import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';


function App() {
  return (
    <div className="min-h-screen flex flex-col">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex">
            <div>Main</div>
          </main>
          <Footer />
        </div>
    </div>
  );
}

export default App;