import CsvTable from "./components/csv-table/CsvTable"

function App() {
  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "60px",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <CsvTable />
    </div>
  )
}

export default App
