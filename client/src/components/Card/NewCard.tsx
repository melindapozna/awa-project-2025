//Page to create a new card
import { Button,
  MenuItem,
  Box,
  TextField,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import { CardProps } from './Cards';
import { useState } from 'react';

const NewCard: React.FC<CardProps> = ({ columnId }) => {
 if (!columnId) {
    return <h1>Error: No column ID provided</h1>;
  }

  const [title, setTitle] = useState<string>("")
  const [subtitle, setSubtitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [color, setColor] = useState("")
  const [workload, setWorkload] = useState("")
  
  //handles the change of the dropdown menu for colors
  const handleChange = (event: SelectChangeEvent) => {
    setColor(event.target.value as string)
  }


  async function saveCard(title: string, subtitle: string, description: string, color: string) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.reload
      }

      const response = await fetch(`http://localhost:1234/columns/${columnId}/cards/new`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          subtitle: subtitle,
          description: description,
          color: color,
          workload: workload
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

  return (
    <>
    
    
      <Box
        component="form"
        sx={{ '& .MuiTextField-root': { m: 1, width: '50ch' } }}
        noValidate
        autoComplete="off"
      >
        <Box>
          <FormControl>
              <InputLabel id="demo-simple-select-label">Color</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={color}
                label="Color"
                onChange={handleChange}
                sx={{minWidth: 150}}
              >
                <MenuItem value={0}>White</MenuItem>
                <MenuItem value={1}>Red</MenuItem>
                <MenuItem value={2}>Green</MenuItem>
                <MenuItem value={3}>Blue</MenuItem>
                <MenuItem value={4}>Yellow</MenuItem>
                <MenuItem value={5}>Gray</MenuItem>
              </Select>
            </FormControl>
        </Box>
        <div>
          <TextField id="filled-basic" label="Title" variant="filled" onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <TextField
            id="outlined-multiline-flexible"
            label="Subtitle"
            multiline
            maxRows={4}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div>
          <TextField
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={10}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <TextField
            id="outlined-number"
            label="Workload"
            defaultValue="0"
            onChange={(e) => setWorkload(e.target.value)}
          />
        </div>
        

      </Box>
      <Box>
       
        <div>
          <Button onClick={() => saveCard(title, subtitle, description, color)} variant="contained">Save</Button>
        </div>
      </Box>
    </>
  )
}

export default NewCard