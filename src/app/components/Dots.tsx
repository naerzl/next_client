import React from "react"

type Props = {
  row: number
  col: number
  color: string
}
export default function Dots(props: Props) {
  const { row, col, color } = props

  const rowArr: number[] = []
  const colArr: number[] = []
  for (let i = 0; i < row; i++) {
    rowArr.push(i)
  }

  for (let i = 0; i < col; i++) {
    colArr.push(i)
  }
  return (
    <div className="h-full flex flex-col justify-between">
      {rowArr.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-x-3">
          {colArr.map((col, colIndex) => (
            <div
              key={colIndex}
              className="w-2 aspect-square rounded-full"
              style={{ backgroundColor: color }}></div>
          ))}
        </div>
      ))}
    </div>
  )
}
