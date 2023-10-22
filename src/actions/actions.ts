import { ErrorSchema } from "../types/errorSchema";
import { UserRecord } from "../types/userRecord";
import { schema } from "./validator";

export const extractStates = (inputString: string) => {
  const regex = /\|(\w{2})\|(\w+)(?=\||$)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    return inputString;
  } else {
    return matches.join(", ");
  }
};

export const makeDataLowerCase = (data: UserRecord[]) => {
  const result = data.map((record) => {
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
      "license number": "",
    };

    for (const key in record) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const value = record[key];
      if (value !== undefined && value !== null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        lowerCaseRecord[key.toLowerCase()] = value.toString().trim();
      }
    }

    return lowerCaseRecord;
  });
  return result;
};

export const modifyData = (data: UserRecord[]) => {
  const result = data.map((record) => {
    const income = Number(record["yearly income"]);
    record["yearly income"] = income.toFixed(2);

    let phoneNumber = record.phone;
    if (!/^\+\d{11}$/.test(phoneNumber)) {
      if (/^1\d{10}$/.test(phoneNumber)) {
        phoneNumber = `+${phoneNumber}`;
      } else if (/^\d{10}$/.test(phoneNumber)) {
        phoneNumber = `+1${phoneNumber}`;
      }
    }
    record.phone = phoneNumber;

    const children = record["has children"].toString().toUpperCase();
    record["has children"] = children === "" ? "FALSE" : children;

    const states = record["license states"];
    record["license states"] = extractStates(states);

    return record;
  });
  return result;
};

export const validateData = (
  data: UserRecord[],
  setErrors: (data: ErrorSchema[]) => void
) => {
  const uniqueEmails = new Map<string, number>();
  const uniquePhones = new Map<string, number>();
  const result = data.map((record, index) => {
    const key = index + 1;

    const email = record.email.toLowerCase().trim();
    if (!uniqueEmails.has(email)) {
      uniqueEmails.set(email, key);
    } else {
      record["duplicate with"] = uniqueEmails.get(email);
      const validationError = {
        id: key,
        headerName: "email",
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      setErrors((prevErrors) => [...prevErrors, validationError]);
    }

    const phone = record.phone.replace(/[^0-9]/g, "");
    if (!uniquePhones.has(phone)) {
      uniquePhones.set(phone, key);
    } else {
      record["duplicate with"] = uniquePhones.get(phone);
      const validationError = {
        id: key,
        headerName: "phone",
      };
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
        console.error("Error");
      }
    }

    const licenseNumbers = record["license number"]
      ?.split(" | ")
      .map((part) => part.trim());
    record["license number"] = licenseNumbers.join(", ").toUpperCase();

    return record;
  });

  return result;
};
