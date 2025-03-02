//page for creating a new board
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useState } from 'react';


const NewBoard = () => {
  const [title, setTitle] = useState<string>("")

  async function saveBoard(title: string) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.reload
      }

      const response = await fetch(`http://localhost:1234/boards/new`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title
        })
      })
      if (!response.ok) {
        if (response.status == 400) {
          localStorage.removeItem("token")
          window.location.href = "/"
        }
        const json = await response.json()
        throw new Error(json.message)
      }
      window.location.href = "/kanban"


    } catch (error) {
      if (error instanceof Error){
        console.log(error.message)
      }
    }
  }


  return (<>
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1, width: '50ch' } }}
      noValidate
      autoComplete="off"
    >
      <div>
      <TextField onChange={(e) => setTitle(e.target.value)} id="filled-basic" label="Title" variant="filled" />
      </div>
      <div>
        <Button onClick={() => saveBoard(title) } variant="contained" sx={{alignSelf: 'right'}}>Save</Button>
      </div>
    
    </Box>
  </>)
}

export default NewBoard;