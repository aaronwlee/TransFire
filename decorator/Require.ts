import { setMeta, setError, deleteError, getErrors } from "../storage.ts"
import { CustomValidator } from "../types.ts";
import { _ } from "../deps.ts";

export function Require(): any
export function Require(requireMessage: string): any
export function Require(validator: CustomValidator[], requireMessage?: string): any
export function Require(...args: any): any {
  const meta: any = {
    require: true,
    message: "Required",
    validators: undefined
  }

  if (args[0]) {
    if (args[0] === "string") {
      meta.message = args[0]
    } else {
      meta.validators = args[0]
    }
  }

  if (args[1]) {
    meta.message = args[1]
  }

  return (target: Object, propery: string, descriptor: PropertyDescriptor = {}) => {
    const className = target.constructor.name
    setMeta(`${className}.${propery}`, meta);

    descriptor = {
      set: (value) => {
        if (meta.validators) {
          const errorMessages: string[] = []
          meta.validators.forEach(v => {
            !v.validator(value) && errorMessages.push(typeof v.message === "function" ? v.message() : v.message)
          })
          _.isEmpty(errorMessages) ? deleteError(`${className}.${propery}`) : setError(`${className}.${propery}`, errorMessages)
        } else {
          deleteError(`${className}.${propery}`)
        }

        // assign value
        if (!getErrors(`${className}.${propery}`)) {
          descriptor.value = value;
        }
      },
      get: () => descriptor.value
    }

    return descriptor
  }
}
