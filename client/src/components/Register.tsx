import { TextField, Button, Alert } from "@mui/material";
import { useState } from "react";

const Register = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [passwordConfirm, setPasswordConfirm] = useState<string>("")
  const [alert, setAlert] = useState<string>("")


  function passwordValid(password: string, passwordConfirm: string) {
    try {
      if (password.length < 5) {
        throw new Error("Password must be at least 5 characters long!")
      }
      if (password != passwordConfirm) {
        throw new Error("Passwords must match")
      }
      sendRegistrationData(username, password)

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
        setAlert(error.message)
      }
    }
  }

  // Sends the username and password to the server, redirect to login if registration is successful
  async function sendRegistrationData(username: string, password: string) {


    try {
      const response = await fetch("http://localhost:1234/register", {
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

      window.location.href = "/login"

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
        setAlert(error.message)
      }
    }
  }

  // Registration form
  return (
    <>
      <div>
        <h1>Create an account</h1>
      </div>
      <div>
        <div>
          <TextField id="outlined-basic" label="Username" variant="outlined" sx={{ m: 1 }} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <TextField id="outlined-password-input" label="Password" type="password" sx={{ m: 1 }} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <TextField id="outlined-password-input" label="Confirm password" type="password" sx={{ m: 1 }} onChange={(e) => setPasswordConfirm(e.target.value)} />
        </div>
        <div>
          <Button variant="contained" sx={{ m: 1 }} onClick={() => passwordValid(password, passwordConfirm)}>Register</Button>
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

export default Register;