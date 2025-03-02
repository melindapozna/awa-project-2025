import { TextField, Button, Alert } from "@mui/material";
import { useState,  useEffect,  } from "react";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [alert, setAlert] = useState<string>("")
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")
  
  console.log("Extracted Token:", token);

  //fetch google client ID from backend
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token)
      window.location.href = "/"
    }
  }, [token])

  // Sends the username and password to the server, stores the JWT token as a localStorage item if received one
  // Alerts the user if login failed
  async function sendData(username: string, password: string) {
    try {
      const response = await fetch("http://localhost:1234/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.message)
      }

      const data = await response.json()
      if (data.token) {
        localStorage.setItem("token", data.token)
        window.location.href = "/"
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
        setAlert(error.message)
      }
    }
  }


  // login form
  return (
    <>
      <script src="https://accounts.google.com/gsi/client" async></script>
      <div>
        <h1>Login</h1>
      </div>
      <div>
        <div>
          <TextField id="outlined-basic" label="Username" variant="outlined" sx={{ m: 1 }} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <TextField id="outlined-password-input" label="Password" type="password" sx={{ m: 1 }} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => (window.location.href = "http://localhost:1234/auth/google")}>
          Login with Google
        </Button>
         
          <Button variant="contained" sx={{ m: 1 }} onClick={() => sendData(username, password)}>Login</Button>
        </div>
        {alert ?
          <Alert variant="outlined" severity="error" onClose={() => { setAlert("") }}>
            {alert}
          </Alert>
          : ""
        }

      </div>
    </>
  )
}

export default Login;