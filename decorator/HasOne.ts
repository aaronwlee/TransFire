import { setMeta, setError, getErrors, deleteError } from "../storage.ts"
import { _ } from "../deps.ts";
import { ValidatorBase } from "./Validator.ts";



export function HasOne<T extends ValidatorBase>(
  Model: new (value?: any) => T,
  params: {
    isNotArray?: string;
    isObject?: string;
  } = {
      isNotArray: "Must be not an array",
      isObject: "Must be a object"
    }
): any {
  const meta: any = {
  }

  if (typeof Model === "function") {
    const model = new Model();
    if (model._type !== "Validator") {
      throw new Error("HasOne is for a nested object which must have an extended ValidatorBase and @Validator()")
    }

    // register the model name to the meta.linked
    // this is needed when init the errors
    meta.linked = model.constructor.name;
  } else {
    throw new Error("HasOne is for a nested object which must have an extended ValidatorBase and @Validator()")
  }


  return (target: Object, property: string, descriptor: PropertyDescriptor = {}) => {
    const className = target.constructor.name
    setMeta(`${className}.${property}`, meta);

    descriptor = {
      set: (value) => {
        if (typeof value === "object") {
          if (Array.isArray(value)) {
            setError(`${className}.${property}`, [params.isNotArray])
          } else {
            const validator = new Model(value);
            _.isEmpty(validator._errors) ? deleteError(`${className}.${property}`) : setError(`${className}.${property}`, validator._errors);
          }
        } else {
          setError(`${className}.${property}`, [params.isObject])
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