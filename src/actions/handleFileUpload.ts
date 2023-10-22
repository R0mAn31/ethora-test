import Papa from "papaparse";
import { UserRecord } from "../types/userRecord";
import { ErrorSchema } from "../types/errorSchema";
import { ChangeEvent } from "react";
import { makeDataLowerCase, modifyData, validateData } from "./actions";

interface FileUploadProps {
  event: ChangeEvent<HTMLInputElement>;
  setErrors: (data: ErrorSchema[]) => void;
  setData: (data: UserRecord[] | null) => void;
  setHeaders: (headers: string[]) => void;
}

const requiredColumns = ["full name", "phone", "email"];

export const handleFileUpload = ({
  event,
  setErrors,
  setData,
  setHeaders,
}: FileUploadProps) => {
  const file = event.target?.files?.[0];

  if (!file) {
    console.error("No file selected");
    setData(null);
    return;
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    console.error("Only .csv files are allowed.");
    setData(null);
    return;
  }

  let data = <UserRecord[]>[];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => {
      data = result.data as UserRecord[];

      if (data.length > 0) {
        const headers = Object.keys(data[0]).map((header) =>
          header.toLowerCase()
        );

        for (const column of requiredColumns) {
          if (!headers.includes(column.toLowerCase())) {
            console.error(
              `Required column "${column}" is missing in the CSV file.`
            );
            setData(null);
            return;
          }
        }

        const lowerCaseData: UserRecord[] = makeDataLowerCase(data);

        const modifiedData = modifyData(lowerCaseData);

        const validatedData = validateData(modifiedData, setErrors);

        setData(validatedData);
        setHeaders(["id", ...headers, "duplicate with"]);
      }
    },
  });
};
