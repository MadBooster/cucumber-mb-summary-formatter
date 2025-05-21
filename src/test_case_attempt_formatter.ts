import { formatterHelpers } from '@cucumber/cucumber'
import * as messages from '@cucumber/messages'
import figures from 'figures'
import indentString from 'indent-string'

import { type IFormatStepRequest, type IFormatTestCaseAttemptRequest, type IParsedTestStep } from './extractedTypes'
import { formatStepArgument } from './step_argument_formatter'
import { doesHaveValue, valueOrDefault } from './value_checker'

const { formatLocation, isIssue, parseTestCaseAttempt } = formatterHelpers

const CHARACTERS = new Map<messages.TestStepResultStatus, string>([
  [messages.TestStepResultStatus.AMBIGUOUS, figures.cross],
  [messages.TestStepResultStatus.FAILED, figures.cross],
  [messages.TestStepResultStatus.PASSED, figures.tick],
  [messages.TestStepResultStatus.PENDING, '?'],
  [messages.TestStepResultStatus.SKIPPED, '-'],
  [messages.TestStepResultStatus.UNDEFINED, '?'],
])

function getStepMessage(testStep: IParsedTestStep): string {
  switch(testStep.result.status) {
    case messages.TestStepResultStatus.AMBIGUOUS:
    case messages.TestStepResultStatus.FAILED:
      return testStep.result.message ?? ''
    case messages.TestStepResultStatus.UNDEFINED:
      return `${
        'Undefined. Implement with the following snippet:' + '\n\n'
      }${indentString(testStep.snippet!, 2)}\n`
    case messages.TestStepResultStatus.PENDING:
      return 'Pending'
  }
  return ''
}

function formatStep({ colorFns, testStep }: IFormatStepRequest): string {
  const {
    result: { status },
    actionLocation,
    attachments,
  } = testStep
  const colorFn = colorFns.forStatus(status)
  const identifier = testStep.keyword + valueOrDefault(testStep.text, '')
  let text = colorFn(`${CHARACTERS.get(status)} ${identifier}`)
  if(doesHaveValue(actionLocation)) {
    text += ` # ${colorFns.location(formatLocation(actionLocation!))}`
  }
  text += '\n'
  if(doesHaveValue(testStep.argument) && isIssue(testStep.result)) {
    const argumentsText = formatStepArgument(testStep.argument!)
    text += indentString(`${colorFn(argumentsText)}\n`, 4)
  }
  attachments.forEach(({ body, mediaType }) => {
    const message = mediaType === 'text/plain' ? `: ${body}` : ''
    text += indentString(`Attachment (${mediaType})${message}\n`, 4)
  })
  const message = getStepMessage(testStep)
  if(message !== '') {
    text += `${indentString(colorFn(message), 4)}\n`
  }
  return text
}

export function formatTestCaseAttempt({
  colorFns,
  snippetBuilder,
  supportCodeLibrary,
  testCaseAttempt,
  printAttachments,
}: IFormatTestCaseAttemptRequest): string {
  const parsed = parseTestCaseAttempt({
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
  })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(
    parsed.testCase.attempt,
    testCaseAttempt.willBeRetried
  )
  text += ` # ${colorFns.location(
    formatLocation(parsed.testCase.sourceLocation!)
  )}\n`
  parsed.testSteps.forEach(testStep => {
    text += formatStep({ colorFns, testStep, printAttachments })
  })
  return `${text}\n`
}

function getAttemptText(attempt: number, willBeRetried: boolean): string {
  if(attempt > 0 || willBeRetried) {
    const numberStr = (attempt + 1).toString()
    const retriedStr = willBeRetried ? ', retried' : ''
    return ` (attempt ${numberStr}${retriedStr})`
  }
  return ''
}
