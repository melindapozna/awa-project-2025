//Component that displays all cards of a single board

import {
  Card as StyledCard,
  CardActionArea,
  CardContent,
  Typography,
  CardActions,
  Button
} from "@mui/material"
import { ICard } from "../interfaces"
import { useState, useEffect, useRef } from "react"

export interface CardProps {
  columnId?: string
}


/*color coding:
    0: White
    1: Red
    2: Green
    3: Blue
    4: Yellow
    5: Gray
*/
const cardColors: Record<string, string> ={
  "0": "#fafafa",
  "1": "#ffab91",
  "2": "#a5d6a7",
  "3": "#81d4fa",
  "4": "#fff59d",
  "5": "#e0e0e0"
}
const fetchAllCards = async (columnId: string) => {

  try {
    const token = localStorage.getItem("token")

    const response = await fetch(`http://localhost:1234/columns/${columnId}/cards`, {
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
    const cards = json.message
    return cards
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      return []
    }
  }
}


const Cards: React.FC<CardProps> = ({ columnId }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  if (!columnId) {
    return <h1>Error: No board ID provided</h1>;
  }

  const [cards, setCards] = useState<ICard[]>([])


  useEffect(() => {
    const getCards = async () => {
      const data = await fetchAllCards(columnId)
      setCards(data)
    }
    getCards()
  }, [refreshTrigger])


  function editCard(cardId: string) {
    const token = localStorage.getItem("token")
    console.log(token)
    if (token) {
      window.location.href = `/cards/${cardId}/edit`
    } else {
      window.location.href = "/"
    }
   
  }

  async function deleteCard(cardId: string) {
    try {
      const token = localStorage.getItem("token")
  
      const response = await fetch(`http://localhost:1234/delete/cards/${cardId}`, {
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

  //drag and drop feature
  const dragCard = useRef<number>(0)
  const draggedOverCard = useRef<number>(0)
  async function handleSort() {
    const cardsClone = [...cards]
    const temp = cardsClone[dragCard.current]
    cardsClone[dragCard.current] = cardsClone[draggedOverCard.current]
    cardsClone[draggedOverCard.current] = temp
    setCards(cardsClone)
    const reorderedCards: ICard[] = cardsClone.map((clonedCard, index) => {
      clonedCard.order = index
      return clonedCard
    })
    setCards([...reorderedCards])

    for (const card of reorderedCards) {
        try {
          const token = localStorage.getItem("token")
          if (!token) {
            window.location.reload
          }
          const response = await fetch(`http://localhost:1234/cards/${card._id}/update`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order: card.order
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

        } catch (error) {
          if (error instanceof Error){
            console.log(error.message)
          }
        }
      }
      
    setRefreshTrigger(trigger => !trigger)
  }

  return (
    <>
      {cards.length > 0 ?
        <>
          {cards.map((card, index) =>
            <div key={card._id}
              draggable
              onDragStart={() => (dragCard.current = index)}
              onDragEnter={() => (draggedOverCard.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
            <StyledCard key={card._id} sx={{ maxWidth: 330, margin: 5, backgroundColor: cardColors[card.color] }}>
              <CardActionArea>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ borderBottom: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography gutterBottom variant="h6" component="div">
                    {card.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {card.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 10 }}>
                    Workload: {card.workload}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary" onClick={() => editCard(card._id)}>Edit</Button>
                <Button size="small" color="error" variant="contained" onClick={() => deleteCard(card._id)}>Delete</Button>
              </CardActions>
            </StyledCard>
            </div>
          )}
        </>
        :
        <>
          <p>No cards yet.</p>
        </>
      }
    </>

  )
}
export default Cards;