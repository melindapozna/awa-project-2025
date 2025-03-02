//page to edit an existing card
import {
  Button,
  MenuItem,
  Box,
  TextField,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import * as React from 'react';
import { useState, useEffect } from 'react';

interface EditCardProps {
  cardId?: string
}

const EditCard: React.FC<EditCardProps> = ({ cardId }) => {
  if (!cardId) {
    return <h1>Error: No card ID provided</h1>;
  }

  const [title, setTitle] = useState<string>("")
  const [subtitle, setSubtitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [color, setColor] = useState("")
  const [workload, setWorkload] = useState("")

  const handleChange = (event: SelectChangeEvent) => {
    setColor(event.target.value as string)
  }

  async function fetchCard(cardId: string) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.reload
      }

      const response = await fetch(`http://localhost:1234/cards/${cardId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
      if (!response.ok) {
        if (response.status == 400) {
          localStorage.removeItem("token")
          window.location.href = "/"
        }
        const json = await response.json()
        throw new Error(json.message)
      }
      const json = await response.json()
      const card = json.message

      setTitle(card.title)
      setSubtitle(card.subtitle)
      setDescription(card.description)
      setColor(card.color)
      setWorkload(card.workload)

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  async function saveCard(title: string, subtitle: string, description: string, color: string) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.reload
      }
      const response = await fetch(`http://localhost:1234/cards/${cardId}/update`, {
        method: "PUT",
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

  
  useEffect(() => {
    const getCards = async () => {
      await fetchCard(cardId)
    }
    getCards()
  }, [])

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
              defaultValue={color}
              sx={{ minWidth: 150 }}
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
          <TextField id="filled-basic" label="Title" variant="filled" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <TextField
            id="outlined-multiline-flexible"
            label="Subtitle"
            multiline
            maxRows={4}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div>
          <TextField
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
        <TextField
          id="outlined-number"
          label="Workload"
          value={workload}
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

export default EditCard