import { ChangeEvent, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material"
import { UserRecord } from "../../types/userRecord"
import { ErrorSchema } from "../../types/errorSchema"
import { handleFileUpload } from "../../actions/handleFileUpload"
import { v4 as uuidv4 } from "uuid"

const CsvTable = () => {
  const [data, setData] = useState<UserRecord[] | null>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [errors, setErrors] = useState<ErrorSchema[]>([])

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload({
      event,
      setErrors,
      setData,
      setHeaders,
    })
  }

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleInput} />
      {data ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell
                    key={uuidv4()}
                    style={{ border: "1px solid #ddd" }}
                  >
                    {header.charAt(0).toUpperCase() + header.slice(1)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((record) => (
                <TableRow key={uuidv4()} style={{ border: "1px solid #ddd" }}>
                  {headers.map((header) => (
                    <TableCell
                      key={uuidv4()}
                      style={{
                        border: "1px solid #ddd",
                        backgroundColor: errors.find(
                          (error) =>
                            `${error.id}_${error.headerName}` ===
                            `${record.id}_${header.toLowerCase()}`
                        )
                          ? "#f0735d"
                          : "white",
                      }}
                    >
                      <div>{record[header as keyof UserRecord]}</div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          sx={{
            maxWidth: "100%",
            backgroundColor: "#f0735d",
            border: "2px solid red",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h1" gutterBottom>
            File format is not correct
          </Typography>
        </Box>
      )}
    </div>
  )
}

export default CsvTable
