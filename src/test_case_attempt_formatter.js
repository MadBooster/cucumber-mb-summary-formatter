import indentString from 'indent-string'
import Status from 'cucumber/lib/status'
import figures from 'figures'
import { formatError } from 'cucumber/lib/formatter/helpers/error_helpers'
import { formatLocation } from 'cucumber/lib/formatter/helpers/location_helpers'
import { parseTestCaseAttempt } from 'cucumber/lib/formatter/helpers/test_case_attempt_parser'
import { formatStepArguments } from 'cucumber/lib/formatter/helpers/step_argument_formatter'

const CHARACTERS = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?',
}

const IS_ISSUE = {
  [Status.AMBIGUOUS]: true,
  [Status.FAILED]: true,
  [Status.PASSED]: false,
  [Status.PENDING]: true,
  [Status.SKIPPED]: false,
  [Status.UNDEFINED]: true,
}

export function isIssue(status) {
  return IS_ISSUE[status]
}

function getStepMessage({ colorFns, testStep }) {
  switch (testStep.result.status) {
    case Status.AMBIGUOUS:
      return colorFns.ambiguous(testStep.result.exception)
    case Status.FAILED:
      return formatError(testStep.result.exception, colorFns)
    case Status.UNDEFINED:
      return `${'Undefined. Implement with the following snippet:' +
        '\n\n'}${indentString(testStep.snippet, 2)}\n`
    case Status.PENDING:
      return colorFns.pending('Pending')
  }
  return ''
}

function formatStep({ colorFns, testStep }) {
  const {
    result: { status },
    actionLocation,
    attachments,
  } = testStep
  const colorFn = colorFns[status]
  const identifier = testStep.keyword + (testStep.text || '')
  let text = colorFn(`${CHARACTERS[status]} ${identifier}`)
  if (actionLocation) {
    text += ` # ${colorFns.location(formatLocation(actionLocation))}`
  }
  text += '\n'
  if (testStep.arguments && isIssue(testStep)) {
    const argumentsText = formatStepArguments(testStep.arguments)
    if (argumentsText) {
      text += indentString(`${colorFn(argumentsText)}\n`, 4)
    }
  }
  if (attachments) {
    attachments.forEach(({ media, data }) => {
      const message = media.type === 'text/plain' ? `: ${data}` : ''
      text += indentString(`Attachment (${media.type})${message}\n`, 4)
    })
  }
  const message = getStepMessage({ colorFns, testStep })
  if (message) {
    text += `${indentString(message, 4)}\n`
  }
  return text
}

export function formatTestCaseAttempt({
  colorFns,
  snippetBuilder,
  testCaseAttempt,
}) {
  const parsed = parseTestCaseAttempt({ snippetBuilder, testCaseAttempt })
  let text = `Scenario: ${parsed.testCase.name}`
  text += getAttemptText(
    parsed.testCase.attemptNumber,
    parsed.testCase.result.retried
  )
  text += ` # ${colorFns.location(
    formatLocation(parsed.testCase.sourceLocation)
  )}\n`
  parsed.testSteps.forEach(testStep => {
    text += formatStep({ colorFns, testStep })
  })
  return `${text}\n`
}

function getAttemptText(attemptNumber, retried) {
  if (retried) {
    return ` (attempt ${attemptNumber}, retried)`
  }
  if (attemptNumber > 1) {
    return ` (attempt ${attemptNumber})`
  }
  return ''
}
