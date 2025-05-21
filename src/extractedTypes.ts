import { type formatterHelpers } from '@cucumber/cucumber'
import type * as messages from '@cucumber/messages'

export type IColorFn = (text: string) => string

export interface IColorFns {
  forStatus: (status: messages.TestStepResultStatus) => IColorFn
  location: IColorFn
  tag: IColorFn
  diffAdded: IColorFn
  diffRemoved: IColorFn
  errorMessage: IColorFn
  errorStack: IColorFn
}

type A = Parameters<typeof formatterHelpers.parseTestCaseAttempt>[0]

export interface IFormatTestCaseAttemptRequest extends A {
  printAttachments?: boolean
  colorFns: IColorFns
}

export interface ILineAndUri {
  line: number
  uri: string
}

export interface IParsedTestStep {
  actionLocation?: ILineAndUri
  argument?: messages.PickleStepArgument
  attachments: messages.Attachment[]
  keyword: string
  name?: string
  result: messages.TestStepResult
  snippet?: string
  sourceLocation?: ILineAndUri
  text?: string
}

export interface IFormatStepRequest {
  colorFns: IColorFns
  testStep: IParsedTestStep
  printAttachments?: boolean
}
