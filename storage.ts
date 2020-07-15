import { _ } from "./deps.ts";
/**
 * Meta container
 */

type MetaTypes = {
  [dynamic: string]: {
    require: boolean
    message: string
    validator?: (value: any) => boolean
  }
}

const meta: MetaTypes = {

}

export function getMeta(key: string) {
  return _.get(meta, key, {})
}

export function setMeta(key: string, data: any) {
  _.set(meta, key, data);
}

/**
 * Errors container
 */

const errors: any = {

}

export function getErrors(key: string) {
  return _.get(errors, key, undefined)
}

export function setError(key: string, data: any) {
  _.set(errors, key, data);
}

export function deleteError(key: string) {
  _.unset(errors, key);
}

/**
 * General
 */

export function getInitErrors(key: string) {
  return iterationErrors(key);
}

function iterationErrors(key: any) {
  const targetMeta = getMeta(key)
  const defaultErrors: any = {}

  Object.keys(targetMeta).forEach(m => {
    if (targetMeta[m].linked) {
      defaultErrors[m] = iterationErrors(targetMeta[m].linked)
    } else if (targetMeta[m].require) {
      defaultErrors[m] = [targetMeta[m].message]
    }
  })

  return defaultErrors;
}