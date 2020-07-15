import { CustomValidator } from "./types.ts"
import { ValidatorBase } from "./decorator/Validator.ts"

export const isString: CustomValidator = {
  validator: (value) => typeof value === "string", message: "Not a string"
}

export const isNumber: CustomValidator = {
  validator: (value) => typeof value === "number", message: "Not a number"
}

export function length(min: number, max?: number): CustomValidator {
  return {
    validator: (value) => {
      if (value.toString().length < min) {
        return false
      }

      if (max && value.toString().length > max) {
        return false
      }

      return true;
    },
    message: `Value length must be greater than ${min}${max ? `, less than ${max}` : ""}`
  }
}

export const isEmail: CustomValidator = {
  validator: (value) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value), message: "Invalid email address"
}

export function isArrayOf(customValidator?: CustomValidator): CustomValidator {
  let errorMessage = "Not an array";
  return {
    validator: (value) => {
      if (!Array.isArray(value)) {
        return false;
      }
      if (customValidator) {
        for (const v of value) {
          if (!customValidator.validator(v)) {
            errorMessage = (typeof customValidator.message === "function" ? customValidator.message() : customValidator.message)
            return false;
          }
        }
      }

      return true;
    },
    message: () => errorMessage
  }
}