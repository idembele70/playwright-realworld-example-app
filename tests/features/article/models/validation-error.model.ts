export type ValidatorErrorField =
  | 'title'
  | 'description'
  | 'body';

export enum ValidationErrorType {
  REQUIRED = "can't be blank",
  UNIQUE = "must be unique",
}