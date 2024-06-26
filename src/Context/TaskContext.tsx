import { createContext, ReactNode, useState, useEffect } from 'react'
import taskProps from '../Types/TaskSchema'
import { error } from 'console'

type TaskProviderProps = {
  children: ReactNode
}

type TaskContextProps = {
  startDate: Date | null
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>
  endDate: Date | null
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>
  allTasks: taskProps[]
  setAllTasks?: React.Dispatch<React.SetStateAction<taskProps[]>>
  taskDetails: Omit<taskProps, 'id'>
  setTaskDetails: React.Dispatch<React.SetStateAction<Omit<taskProps, 'id'>>>
  updateTask: (update: string) => void
  deleteTask: (id: number) => void
  editTask: (id: number) => void
  resetModal: () => void
  isError: boolean
  setIsError: React.Dispatch<React.SetStateAction<boolean>>
  editModal: boolean
  setEditModal: React.Dispatch<React.SetStateAction<boolean>>
  date: string | null
  setDate: React.Dispatch<React.SetStateAction<string | null>>
}
const initialValue = {
  startDate: null,
  setStartDate: () => {},
  endDate: null,
  setEndDate: () => {},
  allTasks: [
    {
      id: 0,
      title: '',
      description: '',
      priority: 'Baixa',
      startDate: null,
      endDate: null,
    },
  ],
  setAllTasks: () => {},
  taskDetails: {
    title: '',
    description: '',
    priority: 'Baixa',
    startDate: null,
    endDate: null,
  },
  setTaskDetails: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  editTask: () => {},
  resetModal: () => {},
  isError: false,
  setIsError: () => {},
  editModal: false,
  setEditModal: () => {},
  date: null,
  setDate: () => {},
} as TaskContextProps

export const TaskContext = createContext<TaskContextProps>(initialValue)

export const TaskContextProvider = ({ children }: TaskProviderProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [allTasks, setAllTasks] = useState<taskProps[]>([])
  const [taskDetails, setTaskDetails] = useState<Omit<taskProps, 'id'>>(
    initialValue.taskDetails
  )
  const [isError, setIsError] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [date, setDate] = useState<string | null>(null)

  const refetchTasks = async () => {
    await fetch('http://localhost:4000/alltasks')
      .then((res) => res.json())
      .then((data) => {
        setAllTasks(data)
      })
      .catch((error) => {
        console.error('Erro ao buscar Tarefas:', error)
      })
  }
  useEffect(() => {
    refetchTasks()
  }, [])

  const resetModal = () => {
    setTaskDetails({
      title: '',
      description: '',
      priority: 'Baixa',
      startDate: null,
      endDate: null,
    })
    setEndDate(null)
    setStartDate(null)
    setIsError(false)
  }

  const updateTask = async (update: string) => {
    await fetch(`http://localhost:4000${update}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskDetails),
    })
      .then((resp) => {
        resp.json()
        console.log(resp)
      })
      .then((data) => {
        refetchTasks()
        resetModal()
      })
      .catch((error) => {
        console.error('Error update:', error)
      })
    console.log(taskDetails)
  }

  const deleteTask = async (id: number) => {
    try {
      await fetch('http://localhost:4000/deletetask', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      })
      refetchTasks()
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }
  const editTask = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:4000/task?id=${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const task = await res.json()
      const { title, description, priority } = task

      const taskData: Omit<taskProps, 'id'> = {
        title,
        description,
        priority,
        startDate,
        endDate,
      }
      setTaskDetails(taskData)
      setStartDate(new Date(task.startDate))
      setEndDate(new Date(task.endDate))
    } catch (error) {
      console.error('Erro ao obter detalhes da tarefa:', error)
    }
  }

  return (
    <TaskContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        allTasks,
        taskDetails,
        setTaskDetails,
        updateTask,
        deleteTask,
        editTask,
        resetModal,
        isError,
        setIsError,
        editModal,
        setEditModal,
        date,
        setDate,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
