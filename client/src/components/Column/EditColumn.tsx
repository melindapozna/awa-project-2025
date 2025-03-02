//page for editing a single column

import {
  Button,
  Box,
  TextField } from '@mui/material';
import * as React from 'react';
import { useState, useEffect } from 'react';

interface EditCardProps {
  columnId?: string
}

const EditColumn: React.FC<EditCardProps> = ({ columnId }) => {
  if (!columnId) {
    return <h1>Error: No card ID provided</h1>;
  }

  const [title, setTitle] = useState<string>("")

  async function fetchColumn(columnId: string) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.reload
      }

      const response = await fetch(`http://localhost:1234/columns/${columnId}`, {
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
      const column = json.message

      setTitle(column.title)


    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  async function saveColumn(title: string) {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.reload
      }
      const response = await fetch(`http://localhost:1234/columns/${columnId}/update`, {
        method: "PUT",
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
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  useEffect(() => {
    const getColumn = async () => {
      await fetchColumn(columnId)
    }
    getColumn()
  }, [])

  return (<>
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1, width: '50ch' } }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField value={title} onChange={(e) => setTitle(e.target.value)} id="filled-basic" label="Title" variant="filled" />
      </div>
      <div>
        <Button onClick={() => saveColumn(title)} variant="contained" sx={{ alignSelf: 'right' }}>Save</Button>
      </div>
    </Box>
  </>)
}

export default EditColumn