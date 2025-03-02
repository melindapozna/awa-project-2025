//Display all boards of a user in a list format

import { useState, useEffect } from "react"
import { Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import { IBoard } from "../interfaces"

const fetchAllBoards = async () => {

  try {
    const token = localStorage.getItem("token")
    
   
    const response = await fetch(`http://localhost:1234/boards`, {
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
    const boards = json.message

    return boards
    
  } catch (error) {
    if (error instanceof Error){
      console.log(error.message)
      return []
    }
  }
}

function loadBoard(boardId: string) {
  window.location.href = `/boards/id/${boardId}`
}

const Boards = () => {
  const [boards, setBoards] = useState<IBoard[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  function createBoard() {
    const token = localStorage.getItem("token")
    if (token) {
      window.location.href = "/boards/new"
    } else {
      window.location.href = "/"
    }
    
  }
  async function deleteBoard(boardId: string) {
    try {
      const token = localStorage.getItem("token")
  
      const response = await fetch(`http://localhost:1234/delete/boards/${boardId}`, {
        method: "DELETE",
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

      setRefreshTrigger(trigger => !trigger)

    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  useEffect(() => {
    const getBoards = async () => {
      const data = await fetchAllBoards()
      setBoards(data)
    }
    getBoards()
  }, [refreshTrigger])

  function editBoard(boardId: string) {
    const token = localStorage.getItem("token")
    console.log(token)
    if (token) {
      window.location.href = `/boards/${boardId}/edit`
    } else {
      window.location.href = "/"
    }
   
  }
  return (<>
    {
      boards.length > 0 ? <>
      <h1>My boards</h1>
      <nav aria-label="secondary mailbox folders">
        <List>
        {boards.map((board) => 
          <ListItem key={board._id} disablePadding>
            <ListItemButton onClick={() => loadBoard(board._id)}>
              <ListItemText primary={board.title} />
            </ListItemButton>
            <Button color="primary" onClick={() => editBoard(board._id)}>Edit</Button>
            <Button color="error" variant="contained" onClick={() => deleteBoard(board._id)}>Delete</Button>
          </ListItem>
        )}
        </List>
      </nav>
      </>
      : <>
      <h1>My boards</h1>
        <p>You have no boards yet.</p>
      </> 
    }
    <div>
      <Button onClick={() => createBoard()} variant="contained">+ Add board</Button>
    </div>
  </>)
 
}

export default Boards