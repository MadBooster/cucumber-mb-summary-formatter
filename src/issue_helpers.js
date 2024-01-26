import indentString from 'indent-string'
import { formatTestCaseAttempt } from './test_case_attempt_formatter.js'

export function formatIssue({
  colorFns,
  cwd,
  number,
  snippetBuilder,
  testCaseAttempt,
  supportCodeLibrary
}) {
  const prefix = `${number.toString()}) `
  const formattedTestCaseAttempt = formatTestCaseAttempt({
    colorFns,
    cwd,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary
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
