import React from "react"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { Table } from "@mui/material"

type HeadersType = {
  title: string
  key: string
}

type Props = {
  headers: HeadersType[]
  data: any[]
  title: string | React.ReactNode
}

export default function TableDesignData(props: Props) {
  const { headers, data, title } = props
  return (
    <div>
      <div className="font-bold text-xl">{title}</div>
      <div>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((col) => (
                <TableCell key={col.key}>{col.title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id}>
                {headers.map((head) => (
                  <TableCell key={head.key + row.id} align="left">
                    {row[head.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
