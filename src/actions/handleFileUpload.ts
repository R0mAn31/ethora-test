import Papa from "papaparse";
import { UserRecord } from "../types/userRecord";
import { schema } from "./validator";
import { ErrorSchema } from "../types/errorSchema";
import { ChangeEvent } from "react";

interface FileUploadProps {
  event: ChangeEvent<HTMLInputElement>;
  setErrors: (data: ErrorSchema[]) => void;
  setData: (data: UserRecord[] | null) => void;
  setHeaders: (headers: string[]) => void;
}

const requiredColumns = ["full name", "phone", "email"];

const extractStates = (inputString: string) => {
  const regex = /\|(\w{2})\|(\w+)(?=\||$)/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(inputString)) !== null) {
    matches.push(match[1]);
  }
  
  if (matches.length === 0) {
    return inputString;
  } else {
    return matches.join(', ');
  }
}

export const handleFileUpload = (
  {event,
  setErrors,
  setData,
  setHeaders
  }: FileUploadProps
) => {
  const file = event.target?.files?.[0];

  if (!file) {
    console.error("No file selected");
    setData(null)
    return;
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    console.error("Only .csv files are allowed.")
    setData(null)
    return
  }

  let data = <UserRecord[]>[]

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => {
      data = result.data as UserRecord[];
      
      if (data.length > 0) {
        const headers = Object.keys(data[0]).map(header => header.toLowerCase());

        for (const column of requiredColumns) {
          if (!headers.includes(column.toLowerCase())) {
            console.error(`Required column "${column}" is missing in the CSV file.`);
            setData(null);
            return;
          }
        }

        const uniqueEmails = new Map<string, number>();
        const uniquePhones = new Map<string, number>();


        const lowerCaseData: UserRecord[] = data.map((record) => {
          const lowerCaseRecord: UserRecord = {
            "full name": "",
            phone: "",
            email: "",
            age: "",
            experience: "",
            "yearly income": "",
            "has children": "",
            "license states": "",
            "expiration date": "",
            "license number": ""
          };
          
          for (const key in record) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
            lowerCaseRecord[key.toLowerCase()] = record[key].toString()?.trim();
          }

          return lowerCaseRecord;
        })

        const modifiedData = lowerCaseData.map((record) => {
          const income = Number(record['yearly income']);
          record['yearly income'] = income.toFixed(2);

          let phoneNumber = record.phone
          if (!/^\+\d{11}$/.test(phoneNumber)) {
            if (/^1\d{10}$/.test(phoneNumber)) {
              phoneNumber = `+${phoneNumber}`;
            } else if (/^\d{10}$/.test(phoneNumber)) {
              phoneNumber = `+1${phoneNumber}`;
            }
          }
          record.phone = phoneNumber;
          
          const children = record['has children'].toString().toUpperCase();
          record['has children'] = children === '' ? "FALSE" : children

          const states = record["license states"]
          record["license states"] = extractStates(states)

          return record;
        });

        const validatedData = modifiedData.map((record, index) => {
          const key = index + 1;

          const email = record.email.toLowerCase().trim();
          if (!uniqueEmails.has(email)) {
            uniqueEmails.set(email, key);
          } else {
            record['duplicate with'] = uniqueEmails.get(email);
            const validationError = {
              id: key,
              headerName: 'email'
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
            setErrors((prevErrors) => [...prevErrors, validationError]);
          }

          const phone = record.phone.replace(/[^0-9]/g, '');
          if (!uniquePhones.has(phone)) {
            uniquePhones.set(phone, key);
          } else {
            record['duplicate with'] = uniquePhones.get(phone);
            const validationError = {
              id: key,
              headerName: 'phone'
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
            setErrors((prevErrors) => [...prevErrors, validationError]);
          }
    
          try {
            schema.validateSync(record, { abortEarly: false });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (errors: any) {
            if (errors.inner) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const validationErrors = errors.inner.map((error: any) => ({
                id: key,
                headerName: error.path,
              }));
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              setErrors((prevErrors) => [...prevErrors, ...validationErrors]);
              record.id = key;
            } else {
              console.error('Error');
            }
          }
    
          return record;
        });
        
        setData(validatedData);
        setHeaders(["id", ...headers, 'duplicate with']);
      }
    },
  });
};