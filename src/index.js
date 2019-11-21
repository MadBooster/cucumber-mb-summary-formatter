import _ from 'lodash'
import { formatSummary, isFailure, isWarning } from 'cucumber/lib/formatter/helpers'
import { formatIssue } from './issue_helpers'
import Formatter from 'cucumber/lib/formatter/'
import Status from 'cucumber/lib/status'

const STATUS_CHARACTER_MAPPING = {
  [Status.AMBIGUOUS]: 'A',
  [Status.FAILED]: 'F',
  [Status.PASSED]: '.',
  [Status.PENDING]: 'P',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: 'U',
}

export default class SummaryFormatter extends Formatter {
  constructor(options) {
    options.eventBroadcaster.on('test-run-finished', () => {
      this.log('\n\n')
    })
    super(options)
    options.eventBroadcaster.on('test-step-finished', this.logProgress)
    options.eventBroadcaster.on('test-run-finished', this.logSummary)
  }

  logProgress = (data) => {
    const {index, result, testCase} = data
    const { status } = result
    const character = this.colorFns[status](STATUS_CHARACTER_MAPPING[status])
    this.log(character)
    if(this.isTestCaseFailure(data)) {
      const {
        gherkinDocument,
        pickle,
        testCase: failureCase
      } = this.eventDataCollector.getTestCaseAttempt(testCase)
      const failureStep = failureCase.steps[index]
      if(failureStep && failureStep.sourceLocation) {
        this.log(this.colorFns[status](`\nFeature: ${pickle.name} / Step: ${failureStep.sourceLocation.uri}:${failureStep.sourceLocation.line})\n`))
      } else {
        this.log(this.colorFns[status](`\nBefore/after hook @ scenario: ${pickle.name} (${testCase.sourceLocation.uri}:${testCase.sourceLocation.line})\n`))
      }
    }
  }

  isTestCaseFailure = (testCase) => {
    return _.includes([Status.AMBIGUOUS, Status.FAILED], testCase.result.status)
  }

  isTestCaseWarning = (testCase) => {
    return _.includes(
      [Status.PENDING, Status.UNDEFINED],
      testCase.result.status
    )
  }

  logSummary = (testRun) => {
    const failures = []
    const warnings = []
    const testCaseAttempts = this.eventDataCollector.getTestCaseAttempts()
    _.each(testCaseAttempts, testCaseAttempt => {
      if (isFailure(testCaseAttempt.result)) {
        failures.push(testCaseAttempt)
      } else if (isWarning(testCaseAttempt.result)) {
        warnings.push(testCaseAttempt)
      }
    })
    if (failures.length > 0) {
      this.logIssues({ issues: failures, title: 'Failures' })
    }
    if (warnings.length > 0) {
      this.logIssues({ issues: warnings, title: 'Warnings' })
    }
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        testCaseAttempts,
        testRun,
      })
    )
  }

  logIssues = ({ issues, title }) => {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          testCaseAttempt,
        })
      )
    })
  }
}
