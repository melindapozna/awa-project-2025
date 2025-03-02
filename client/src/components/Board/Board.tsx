import { useEffect, useState } from "react";
import Columns from "../Column/Columns";
import { IBoard } from "../interfaces";
  

interface BoardProps {
  boardId?: string
}

const Board: React.FC<BoardProps> = ({ boardId }) => {
  if (!boardId) {
    return <h1>Error: No board ID provided</h1>;
  }
    
    const [loaded, setLoaded] = useState(false);
    const [receivedBoard, setBoard] = useState<IBoard | null>(null)

    useEffect(() => {
      const fetchBoardData = async () => {

        const token = localStorage.getItem("token")
 
        const response = await fetch(`http://localhost:1234/boards/id/${boardId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        })
        const data = await response.json()
        if (response.ok) {
          setBoard({
            _id: data._id,
            title: data.title,
            owner: data.owner
          })
          setLoaded(true)
    
        } else {
          if (response.status == 400) {
            localStorage.removeItem("token")
            window.location.href = "/"
          }
          console.log(data.message)
          setLoaded(true)
        }
      }
      fetchBoardData()
    }, [])
    

    return <>
    {!loaded ?
    <h2>Loading...</h2>
    :
    <div>
      {!receivedBoard ?
      <h2>Board not found</h2>
      :
      <>
      <h1>{receivedBoard.title}</h1>
      <Columns key={boardId} boardId={boardId} />
      </>
      }
    </div> 
    }
    </>
}
export default Board;