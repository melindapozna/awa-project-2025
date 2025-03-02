import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router';
import { useEffect, useState } from 'react';

const Header = () => {
  const [token, setToken] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setToken(localStorage.token)
    setLoaded(true)
  }, [])

  // Removes the JWT token from localStorage
  function destroyToken() {
    localStorage.removeItem("token")
    setToken(null)
    setLoaded(true)
    window.location.href = "/login"
  }

  return (
    <>
    {!loaded ?
      <h1>Loading...</h1>
    :
      <Box sx={{ flexGrow: 1 , marginBottom: 5}}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Fun with Kanban
          </Typography>
          <Button component={RouterLink} to="/" color="inherit">Home</Button>
          

          {/* Create login and register button if no user is logged in, logout if user is found. */}
          {token ?
            <>
              <Button component={RouterLink} to="/kanban" color="inherit">Kanban board</Button>
              <Button component={RouterLink} to="/login" onClick={() => destroyToken()} color="inherit">Logout</Button>
            </>
            
            :
            <>
              <Button component={RouterLink} to="/login" color="inherit">Login</Button>
              <Button component={RouterLink} to="/register" color="inherit">Register</Button>
            </>
          }
        </Toolbar>
      </AppBar>
      </Box>}
    </>
    
    )

   
}

export default Header;