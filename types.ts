export type CustomValidator = {
  validator: (value: any) => boolean,
  message: MessageType,
}


type MessageType = string | (() => string);