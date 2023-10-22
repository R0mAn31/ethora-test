import { Button } from "@mui/material"
import { ChangeEvent, FC } from "react"

interface InputButtonProps {
  handleInput: (event: ChangeEvent<HTMLInputElement>) => void
}

const InputButton: FC<InputButtonProps> = ({ handleInput }) => {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button variant="contained" color="success" component="span">
        Choose a file
      </Button>
      <input
        type="file"
        accept=".csv"
        onChange={handleInput}
        style={{ visibility: "hidden" }}
      />
    </label>
  )
}

export default InputButton
