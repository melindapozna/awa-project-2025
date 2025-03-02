//Page for creating a new column

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useState } from 'react';
import { ColumnProps } from './Columns';

const NewColumn: React.FC<ColumnProps> = ({ boardId }) => {
  if (!boardId) {
    return <h1>Error: No board ID provided</h1>;
  }

  const [title, setTitle] = useState<string>("")

  async function saveColumn(title: string) {
    try {
      const token = localStorage.getItem("token")
 

      const response = await fetch(`http://localhost:1234/boards/${boardId}/columns/new`, {
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
      window.location.href = `/boards/id/${boardId}`


    } catch (error) {
      if (error instanceof Error) {
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
        <Button onClick={() => saveColumn(title)} variant="contained" sx={{ alignSelf: 'right' }}>Save</Button>
      </div>

    </Box>
  </>)
}

export default NewColumn;