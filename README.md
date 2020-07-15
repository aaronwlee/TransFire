# TransFire - v0.1

Create a class-based data transfer object(DTO) with decorators and validating data at the same time. 

Only for [Deno](https://deno.land/)

## Contents
- [Getting Start](#getting-start)
- [Customize Validator](#customize-your-validator)
- [Nest Object](#nest-object)
- [Decorators](#decorators)

## Getting Start
> MUST: Before you start it, You must configure the tsconfig.json file to this project is working properly.

**Please add this three configures into the compilerOptions**
```
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
"strictPropertyInitialization": false,
```

### Let's start create a validator
```ts
import { 
  Validator, 
  ValidatorBase, 
  Require, 
  Optional, 
  isString, 
  isNumber, 
  length, 
  isEmail, 
  isArrayOf 
} from "https://x.nest.land/TransFire@0.1.0/mod.ts";

@Validator()
class UserDTO extends ValidatorBase {
  @Require([isEmail])
  email: string;

  @Require([isString, length(5, 10)])
  firstName: string;

  @Require([isString])
  lastName: string;

  @Optional([isNumber])
  age: number;

  @Optional([isString])
  phoneNumber: string;

  @Require([isArrayOf(isString)])
  followers: string[]
}
```

This generated object will have these following methods.
```ts
const userObject = new UserDTO();
```

- `constructor: (params: Object) => void;`
<br /> Start the validating and initializing at the same time.

```ts
const userObject = new UserDTO(values);
```

- `_validator: (params: Object) => null | Object;`
<br /> Start the validating.
<br /> This will return `series of the errors` or `null`

```ts
const errors = userObject._validator(values);
```

- `_type: string;`
<br /> Get the `type` of object, this will return "Validator" string.

- `_name: string;`
<br /> Get the `name` of object, this will return "UserDTO" string.

- `_errors: Object | null;`
<br /> Get the result of the validation process.
<br /> This will return `series of the errors` or `null`


- `_toObject: Function;`
<br /> Return the data transfer result.
<br /> This will return `series of the errors` or `null`
> Note: Due to this validator object has been restructured by the decorator, you may not get values from the entire object class. 

```ts
console.log(userObject)

// result
UserDTO {
  _validator: [Function],
  _type: "Validator",
  _name: "UserDTO",
  _errors: { ...errors },
  _toObject: [Function: value]
}

// but you can get
console.log(userObject.firstName)

// result
Aaron
```

### Try this simple example
```ts
import { Validator, ValidatorBase, Require, Optional, isString, isNumber, length, isEmail, isArrayOf } from "https://x.nest.land/TransFire@0.1.0/mod.ts";

@Validator()
class UserDTO extends ValidatorBase {
  @Require([isEmail])
  email: string;

  @Require([isString, length(5, 10)])
  firstName: string;

  @Require([isString])
  lastName: string;

  @Optional([isNumber])
  age: number;

  @Optional([isString])
  phoneNumber: string;

  @Require([isArrayOf(isString)])
  followers: string[]
}

const wrongObject = {
  email: 123,
  firstName: "Aar",
  age: "25",
  wrongParams: "This is wrong!"
}

const wrongValidation = new UserDTO(wrongObject);
console.log("wrong", wrongValidation._errors)
// wrong {
//   email: [ "Invalid email address" ],
//   firstName: [ "Value length must be greater than 5, less than 10" ],
//   lastName: [ "Required" ],
//   followers: [ "Required" ],
//   age: [ "Not a number" ],
//   wrongParams: [ "Wrong parameter" ]
// }

const correctObject = {
  email: "aaronwoolee95@gmail.com",
  firstName: "Aaron",
  lastName: "Lee",
  followers: [
    "#a135",
    "#b414"
  ]
}

const correctValidation = new UserDTO(correctObject);
console.log("corrent", correctValidation._errors)
// corrent null
```

## Customize your validator
You can customize and use it for any type of validation procedure.
```ts
type CustomValidator = {
  validator: (value: any) => boolean,
  message: MessageType,
}


type MessageType = string | (() => string);
```

An example of Canada phone number validator

```ts
import { Validator, ValidatorBase, Optional, isString, CustomValidator } from "https://x.nest.land/TransFire@0.1.0/mod.ts";

const CAPhoneNumber: CustomValidator = {
  validator: (value) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value),
  message: "Invalid Phone number"
}

// assign it as
@Validator()
class UserDTO extends ValidatorBase {
  @Optional([isString, CAPhoneNumber])
  phoneNumber: string;
}

```

An example of an age group validator.

```ts
import { Validator, ValidatorBase, Require, isNumber, CustomValidator } from "https://x.nest.land/TransFire@0.1.0/mod.ts";

function AdultsGroup(): CustomValidator {
  let dynamicMessages = "You do not belong to the adult group."
  return {
    validator: (value) => {
      if (value < 25) {
        dynamicMessages = "You're too young!"
        return false;
      } else if (value > 65) {
        dynamicMessages = "You're too old!"
        return false;
      }

      return true;
    },
    message: () => dynamicMessages
  }
}

// assign it as
@Validator()
class UserDTO extends ValidatorBase {
  @Require([isNumber, AdultsGroup()])
  age: number;
}
```

## Nest Object
You can assign the nest validation object that you may want the validator to perform their validation.

Here you can use `@HasOne` and `@HasMany`.

```ts
import { Validator, ValidatorBase, Require, Optional, isString, isNumber, length, isArrayOf, HasMany, HasOne } from "https://x.nest.land/TransFire@0.1.0/mod.ts";

@Validator()
class NameDTO extends ValidatorBase {
  @Require([isString, length(5, 10)])
  firstName: string;

  @Require([isString])
  lastName: string;
}

@Validator()
class AddressDTO extends ValidatorBase {
  @Optional([isString])
  street: string;

  @Optional([isString])
  postalCode: string;

  @Optional([isString])
  phoneNumber: string;
}

@Validator()
class UserDTO extends ValidatorBase {
  @HasOne(NameDTO)
  name: Object;

  @HasMany(AddressDTO)
  address: Object[]

  @Optional([isNumber])
  age: number;

  @Require([isArrayOf(isString)])
  followers: string[]
}
```


## Decorators

- `@Validator(ValidatorOption)`
<br /> Init validator, you can assign the wrong parameter message.

```ts
interface ValidatorOption {
  // true: adding errors when the data has an invalid parameter.
  // false: skipping errors when the data has an invalid parameter.
  errorOnInvalidParams?: boolean,

  // message string
  invalidParamsMessage?: string
}

// default errorOnInvalidParams = true
// default invalidParamsMessage = "Wrong parameter"

```

<br />
<br />

- `@Require()`
- `@Require(requireMessage: string)`
- `@Require(validator: CustomValidator[], requireMessage?: string)`
- `@Require(validator: CustomValidator[], requireMessage?: string)`
<br /> Set the property as a required field.
<br />
<br />

- `@Optional()`
- `@Optional(validator: CustomValidator[])`
<br /> Set the property as an optional field.
<br />
<br />

- `@HasMany<T extends ValidatorBase>(
  Model: new (value?: any) => T,
  params: {
    isArray?: string;
    isObject?: string;
  } = {
      isArray: "Must be an array",
      isObject: "Must be a object"
    }
)`
<br /> Set the property as a nested field.
<br />
<br />

- `@HasOne<T extends ValidatorBase>(
  Model: new (value?: any) => T,
  params: {
    isNotArray?: string;
    isObject?: string;
  } = {
      isNotArray: "Must be not an array",
      isObject: "Must be a object"
    }
)`
<br /> Set the property as a nested array field.
<br />
<br />

```
```

There are several modules that are directly adapted from other modules. They have preserved their individual licenses and copyrights. All of the modules, including those directly adapted are licensed under the MIT License.

All additional work is copyright 2020 the TransFire authors. All rights reserved.