import { Box, Typography } from '@mui/material';
import Navbar from './components/navbar';

export default function App() {
  const handleLogin = () => {
    console.log('Login clicked');
    // Add navigation logic here
  };

  const handleRegister = () => {
    console.log('Register clicked');
    // Add navigation logic here
  };

  return (
    <>
      <Navbar onLoginClick={handleLogin} onRegisterClick={handleRegister} />
        <Typography variant="h4">
          Welcome to Dim Sum Restaurant
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Your favorite dim sum restaurant management system.
        </Typography>
    </>
  );
}