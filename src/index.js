import _ from 'lodash'
import { formatSummary } from 'cucumber/lib/formatter/helpers'
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
      } = this.eventDataCollector.getTestCaseData(testCase.sourceLocation)
      const failureStep = failureCase.steps[index]
      if(failureStep && failureStep.sourceLocation) {
        this.log(this.colorFns[status](`\Feature: ${pickle.name} / Step: ${failureStep.sourceLocation.uri}:${failureStep.sourceLocation.line})\n`))
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
    _.each(this.eventDataCollector.testCaseMap, testCase => {
      if (this.isTestCaseFailure(testCase)) {
        failures.push(testCase)
      } else if (this.isTestCaseWarning(testCase)) {
        warnings.push(testCase)
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
        testCaseMap: this.eventDataCollector.testCaseMap,
        testRun,
      })
    )
  }

  logIssues = ({ issues, title }) => {
    this.log(`${title}:\n\n`)
    issues.forEach((testCase, index) => {
      const {
        gherkinDocument,
        pickle,
      } = this.eventDataCollector.getTestCaseData(testCase.sourceLocation)
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          gherkinDocument,
          number: index + 1,
          pickle,
          snippetBuilder: this.snippetBuilder,
          testCase,
        })
      )
    })
  }
}
