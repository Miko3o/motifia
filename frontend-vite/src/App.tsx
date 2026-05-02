import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import Grammar from './pages/grammar/Grammar';
import Dictionary from './pages/dictionary/Dictionary';
import WordDetail from './pages/dictionary/components/WordDetail';
import Admin from './pages/admin/Admin';
import AdminCallback from './pages/admin/AdminCallback';

// Route change logger component
const RouteLogger = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  console.log('Route changed to:', location.pathname);
  console.log('Current route state:', location.state);
  
  return <>{children}</>;
};

function App() {
  console.log('App component mounted');
  
  return (
    <AuthProvider>
      <Router>
        <RouteLogger>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/grammar" element={<Grammar />} />
                <Route path="/dictionary" element={<Dictionary />} />
                <Route path="/dictionary/word/:word" element={<WordDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/callback" element={<AdminCallback />} />
              </Routes>
            </main>
          </div>
        </RouteLogger>
      </Router>
    </AuthProvider>
  );
}

export default App;
