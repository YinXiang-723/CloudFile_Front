import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import styled from '@emotion/styled';
import Login from './pages/Login';
import Home from './pages/Home';
import FileStorage from './pages/FileStorage';
import NavBar from './components/NavBar';
import { AuthProvider } from './contexts/AuthContext';

const { Content } = Layout;

const StyledLayout = styled(Layout)`
  background: linear-gradient(135deg, rgba(200, 255, 200, 0.4), rgba(150, 255, 150, 0.2));
  min-height: 100vh;
`;

const GlassContent = styled(Content)`
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin: 24px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <StyledLayout>
          <NavBar />
          <GlassContent>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route path="/storage" element={<FileStorage />} />
            </Routes>
          </GlassContent>
        </StyledLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;