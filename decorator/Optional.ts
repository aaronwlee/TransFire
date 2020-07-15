import { setMeta, setError, getErrors } from "../storage.ts"
import { CustomValidator } from "../types.ts";
import { _ } from "../deps.ts";

export function Optional(): any
export function Optional(validator: CustomValidator[]): any
export function Optional(...args: any): any {
  const meta: any = {
    require: false,
    message: "Somthing wrong",
    validators: undefined
  }

  if (args[0]) {
    meta.validators = args[0]
  }

  return (target: Object, property: string, descriptor: PropertyDescriptor = {}) => {
    const className = target.constructor.name
    setMeta(`${className}.${property}`, meta);

    descriptor = {
      set: (value) => {
        if (!_.isEmpty(meta.validators)) {
          const errorMessages: string[] = []
          meta.validators.forEach(v => {
            !v.validator(value) && errorMessages.push(typeof v.message === "function" ? v.message() : v.message)
          })
          !_.isEmpty(errorMessages) && setError(`${className}.${property}`, errorMessages)
        }

        // assign value
        if (!getErrors(`${className}.${property}`)) {
          descriptor.value = value;
        }
      },
      get: () => descriptor.value
    }

    return descriptor
  }
}