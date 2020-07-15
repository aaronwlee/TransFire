import { getInitErrors, setError, getErrors, getMeta } from "../storage.ts";
import { _ } from "../deps.ts";

export class ValidatorBase {
  constructor(...args: any) { }

  _validator: (params: Object) => null | Object;

  _type: string;
  _name: string;
  _errors: Object | null;
  _toObject: Function;
}

export interface ValidatorOption {
  errorOnInvalidParams?: boolean,
  invalidParamsMessage?: string
}

export function Validator({
  errorOnInvalidParams,
  invalidParamsMessage,
}: ValidatorOption = {
    errorOnInvalidParams: true,
    invalidParamsMessage: "Wrong parameter"
  }
) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor implements ValidatorBase {
      constructor(...args: any[]) {
        super(args);
        setError(constructor.name, getInitErrors(constructor.name))

        Object.defineProperties(this, {
          _validator: {
            writable: false
          },
          _type: {
            writable: false
          },
          _name: {
            writable: false
          },
          _errors: {
            get: () => {
              const errors = getErrors(constructor.name)
              return _.isEmpty(errors) ? null : errors
            },
          },
          _toObject: {
            value: () => {
              const result: Object = {}

              Object.getOwnPropertyNames(constructor.prototype).forEach(key => {
                if (key !== "constructor") {

                  if (getMeta(`${constructor.name}.${key}`).require) {
                    result[key] = constructor.prototype[key];
                  } else if (constructor.prototype[key]) {
                    result[key] = constructor.prototype[key];
                  }

                }
              })

              return result;
            },
            writable: false
          }
        })

        args[0] && this._validator(args[0]);
      }

      _validator = function (raw: Object) {
        const properties = constructor.prototype
        Object.keys(raw).forEach(r => {
          if (_.has(properties, r)) {
            properties[r] = raw[r];
          } else if (errorOnInvalidParams) {
            setError(`${constructor.name}.${r}`, [invalidParamsMessage])
          }
        })

        const errors = getErrors(constructor.name);
        return _.isEmpty(errors) ? null : errors;
      }

      _type = "Validator";
      _name = constructor.name;
      _errors = {};
      _toObject = () => null;
    }
  }
}


