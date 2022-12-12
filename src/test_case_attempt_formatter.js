import indentString from 'indent-string'
import figures from 'figures'
import { TestStepResultStatus } from '@cucumber/messages'
import { doesHaveValue, valueOrDefault } from '@cucumber/cucumber/lib/value_checker'
import { formatStepArgument } from '@cucumber/cucumber/lib/formatter/helpers/step_argument_formatter'
import {
  formatterHelpers
} from '@cucumber/cucumber'

const { formatLocation, isIssue, parseTestCaseAttempt } = formatterHelpers

const CHARACTERS = {
  [TestStepResultStatus.AMBIGUOUS]: figures.cross,
  [TestStepResultStatus.FAILED]: figures.cross,
  [TestStepResultStatus.PASSED]: figures.tick,
  [TestStepResultStatus.PENDING]: '?',
  [TestStepResultStatus.SKIPPED]: '-',
  [TestStepResultStatus.UNDEFINED]: '?'
}

function getStepMessage(testStep) {
  switch(testStep.result.status) {
    case TestStepResultStatus.AMBIGUOUS:
    case TestStepResultStatus.FAILED:
      return testStep.result.message
    case TestStepResultStatus.UNDEFINED:
      return `${
        'Undefined. Implement with the following snippet:' + '\n\n'
      }${indentString(testStep.snippet, 2)}\n`
    case TestStepResultStatus.PENDING:
      return 'Pending'
  }
  return ''
}

function formatStep({ colorFns, testStep }) {
  const {
    result: { status },
    actionLocation,
    attachments
  } = testStep
  const colorFn = colorFns.forStatus(status)
  const identifier = testStep.keyword + valueOrDefault(testStep.text, '')
  let text = colorFn(`${CHARACTERS[status]} ${identifier}`)
  if(doesHaveValue(actionLocation)) {
    text += ` # ${colorFns.location(formatLocation(actionLocation))}`
  }
  text += '\n'
  if(doesHaveValue(testStep.argument) && isIssue(testStep)) {
    const argumentsText = formatStepArgument(testStep.argument)
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
  cwd,
  snippetBuilder,
  supportCodeLibrary,
  testCaseAttempt
}) {
  const parsed = parseTestCaseAttempt({
    cwd,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary
  })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(
    parsed.testCase.attempt,
    parsed.testCase.worstTestStepResult.willBeRetried
  )
  text += ` # ${colorFns.location(
    formatLocation(parsed.testCase.sourceLocation)
  )}\n`
  parsed.testSteps.forEach((testStep) => {
    text += formatStep({ colorFns, testStep })
  })
  return `${text}\n`
}

function getAttemptText(attempt, willBeRetried) {
  if(attempt > 0 || willBeRetried) {
    const numberStr = (attempt + 1).toString()
    const retriedStr = willBeRetried ? ', retried' : ''
    return ` (attempt ${numberStr}${retriedStr})`
  }
  return ''
}
