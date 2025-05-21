import type * as messages from '@cucumber/messages'
import indentString from 'indent-string'

import { type IFormatTestCaseAttemptRequest } from './extractedTypes.js'
import { formatTestCaseAttempt } from './test_case_attempt_formatter.js'

type IFormatIssueRequest = IFormatTestCaseAttemptRequest & {
  number: number
}

export function isFailure(
  result: messages.TestStepResult,
  willBeRetried = false
): boolean {
  return (
    result.status === 'AMBIGUOUS' ||
    result.status === 'UNDEFINED' ||
    (result.status === 'FAILED' && !willBeRetried)
  )
}

export function formatIssue({
  colorFns,
  number,
  snippetBuilder,
  testCaseAttempt,
  supportCodeLibrary,
  printAttachments = true,
}: IFormatIssueRequest): string {
  const prefix = `${number.toString()}) `
  const formattedTestCaseAttempt = formatTestCaseAttempt({
    colorFns,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
    printAttachments,
  })
  const lines = formattedTestCaseAttempt.split('\n')
  const updatedLines = lines.map((line, index) => {
    if(index === 0) {
      return `${prefix}${line}`
    }
    return indentString(line, prefix.length)
  })
  return updatedLines.join('\n')
}
