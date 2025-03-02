//Display all columns

import { useEffect, useState } from "react";
import { IColumn } from "../interfaces";
import Cards from "../Card/Cards";

import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box} from "@mui/material";


export interface ColumnProps {
  boardId?: string
}

const fetchAllColumns = async (boardId: string) => {
  
  try {
    const token = localStorage.getItem("token")
    
    const response = await fetch(`http://localhost:1234/boards/id/${boardId}/columns`, {
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
    const columns = json.message

    return columns

  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      return []
    }
  }
}


const Columns: React.FC<ColumnProps> = ({ boardId }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(false)
  if (!boardId) {
    return <h1>Error: No board ID provided</h1>;
  }

  const [columns, setColumns] = useState<IColumn[]>([])

  function createColumn() {
    if (localStorage.getItem("token")) {
      window.location.href = `${boardId}/columns/new`
    } else {
      window.location.href = "/"
    }
  }

  function createCard(columnId: string) {
    if (localStorage.getItem("token")) {
      window.location.href = `/columns/${columnId}/cards/new`
    } else {
      window.location.href = "/"
    }
  }

  useEffect(() => {
    const getColumns = async () => {
      const data = await fetchAllColumns(boardId)
      setColumns(data)
    }
    getColumns()
  }, [refreshTrigger])

  async function deleteColumn(columnId: string) {
    try {
      const token = localStorage.getItem("token")
  
      const response = await fetch(`http://localhost:1234/delete/columns/${columnId}`, {
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

  function editColumn(columnId: string) {
    const token = localStorage.getItem("token")
    console.log(token)
    if (token) {
      window.location.href = `/columns/${columnId}/edit`
    } else {
      window.location.href = "/"
    }
  }

  return(<>
  
    {
      columns.length > 0 ?
        <Box sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 2,
          margin: 5
        }}>
          {columns.map((column) =>
            <Card key={column._id} sx={{ maxWidth: 345, minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div"sx={{borderBottom: 1, borderColor: "#bbdefb"}}>
                    {column.title}
                  </Typography>
                  <Cards columnId={column._id}></Cards>
                </CardContent>
              
              <CardActions sx={{ height: 30, backgroundColor: "#bbdefb" }}>
                <Button size="small" color="primary" onClick={() => editColumn(column._id)}>Edit</Button>
                <Button size="small" variant="contained" onClick={() => createCard(column._id)}>+ Add card</Button>
                <Button size="small" color="error" variant="contained" onClick={() => deleteColumn(column._id)}>Delete</Button>
              </CardActions>
            </Card>
          )}
        </Box>
      : <>
        <p>You have no columns yet.</p>
      </> 
    }
    <div>
      <Button onClick={() => createColumn()} variant="contained">+ Add column</Button>
    </div>
  </>)
 
}
export default Columns