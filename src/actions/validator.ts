import * as yup from "yup"

export const schema = yup.object().shape({
    "full name": yup.string().required("full name"),
    phone: yup
      .string()
      .matches(/^(\+[0-9]{11}|\+1[0-9]{10}|[0-9]{10})$/)
      .required(),
    email: yup.string().email().required(),
    age: yup.number().integer().min(21).max(100).required(),
    experience: yup
      .number()
      .min(0)
      .test(function (value) {
        const age = this.parent.age
        if (value !== undefined && age !== undefined) {
          return value < age
        }
        return true
      }),
    "yearly income": yup
      .number()
      .typeError('Yearly income повинен бути числовим значенням')
        .max(1000000)
        .test(
            (value) => {
            if (value === undefined) return true;
            const parts = value.toString().split('.');
            if (parts.length === 1) return true;
            if (parts[1].length === 2) return true;
            return false;
            }
        ),
  "has children": yup.string().required("has children").test((value) => {
      const upperCase = value.toUpperCase();
      return upperCase === 'TRUE' || upperCase === 'FALSE';
    }),
    "license states": yup
      .string()
      .matches(/^[A-Z][A-Za-z,\s]*$/)
      .required(),
    "expiration date": yup.string().required().test(
        (value) => {
          if (!value) return true;
            const dateRegExp = /^(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/;
            if (!dateRegExp.test(value)) return false;
            const inputDate = new Date(value)
            if (inputDate > new Date()) {
                return true;
              }
        }
      ),
    "license number": yup
      .string()
      .matches(/^[0-9a-zA-Z]{6}$/)
      .required(),
  })