export interface IBoard {
  _id: string
  title: string
  columns?: Array<string>
  owner: string
}

export interface IColumn {
  _id: string
  title: string
  cards?: Array<string>
}

export interface ICard {
  _id: string
  title: string
  subtitle: string
  description: string
  color: string
  order: number
  workload: string
}
