import './App.css'
import Boards from './components/Board/Boards.tsx'
import Header from './components/Header.tsx'
import Home from './components/Home.tsx'
import Login from './components/Login.tsx'
import Register from './components/Register.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import NewBoard from './components/Board/NewBoard.tsx'
import Board from './components/Board/Board.tsx'
import { useParams } from 'react-router'
import NewColumn from './components/Column/NewColumn.tsx'
import NewCard from './components/Card/NewCard.tsx'
import EditCard from './components/Card/EditCard.tsx'
import EditBoard from './components/Board/EditBoard.tsx'
import EditColumn from './components/Column/EditColumn.tsx'

// Check if there is a user logged in to prevent accessing URLs manually
function userExists() {
  if (!localStorage.getItem("token")) {
    return false
  }
  return true
}

const BoardWrapper = () => {
  const { id } = useParams();
  return <Board boardId={id} />;
}


const ColumnWrapper = () => {
  const { id } = useParams();
  return <NewColumn boardId={id} />;
}

const CardWrapper = () => {
  const { id } = useParams();
  return <NewCard columnId={id} />;
}

const EditCardWrapper = () => {
  const { id } = useParams();
  return <EditCard cardId={id} />;
}


const EditColumnWrapper = () => {
  const { id } = useParams();
  return <EditColumn columnId={id} />;
}

const EditBoardWrapper = () => {
  const { id } = useParams();
  return <EditBoard boardId={id} />;
}

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/login/success" element={<Login />} />
          
          <Route path="/register" element={<Register />} />
          {userExists() ?
            <>
            
              <Route path="/kanban" element={<Boards />} />
              <Route path="/boards/new" element={<NewBoard />} />
              <Route path="/boards/id/:id" element={<BoardWrapper />} />
              <Route path="/boards/id/:id/columns/new" element={<ColumnWrapper />} />
              <Route path="/columns/:id/cards/new" element={<CardWrapper />} />
              <Route path="/cards/:id/edit" element={<EditCardWrapper />} />
              <Route path="/columns/:id/edit" element={<EditColumnWrapper />} />
              <Route path="/boards/:id/edit" element={<EditBoardWrapper />} />
            </>
            :
            <Route path="*" element={<><h1>404: Page not found</h1></>} />
          }
          <Route path="*" element={<><h1>404: Page not found</h1></>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
