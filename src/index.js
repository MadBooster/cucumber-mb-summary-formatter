
import { TestStepResultStatus } from '@cucumber/messages'
import SummaryFormatter from '@cucumber/cucumber/lib/formatter/summary_formatter'
import { isFailure } from '@cucumber/cucumber/lib/formatter/helpers/issue_helpers'
import { formatIssue } from './issue_helpers'
import { getGherkinScenarioLocationMap, getGherkinStepMap } from '@cucumber/cucumber/lib/formatter/helpers/gherkin_document_parser'
import { getPickleStepMap } from '@cucumber/cucumber/lib/formatter/helpers/pickle_parser'

const STATUS_CHARACTER_MAPPING = {
  [TestStepResultStatus.AMBIGUOUS]: 'A',
  [TestStepResultStatus.FAILED]: 'F',
  [TestStepResultStatus.PASSED]: '.',
  [TestStepResultStatus.PENDING]: 'P',
  [TestStepResultStatus.SKIPPED]: '-',
  [TestStepResultStatus.UNDEFINED]: 'U'
}

export default class MbSummaryFormatter extends SummaryFormatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', this.parseEnvelope)
    this.numberOfSteps = 0
    this.numberOfScenarios = 0
    this.currentScenarioCount = 1
    this.failureCount = 0
  }

  parseEnvelope = envelope => {
    if(envelope.testCase != null) {
      this.incrementStepCount(envelope.testCase)
    } else if(envelope.testStepFinished != null) {
      this.logProgress(envelope.testStepFinished)
    } else if(envelope.testCaseFinished != null) {
      this.logStepProgress(envelope.testCaseFinished)
    } else if(envelope.testRunFinished != null) {
      this.log('\n\n')
    }
  }

  incrementStepCount = (testCase) => {
    this.numberOfSteps += testCase.testSteps.length
    this.numberOfScenarios++
  }

  logStepProgress = (testCaseFinished) => {
    const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
    const { attempt, worstTestStepResult } = testCaseAttempt
    if(worstTestStepResult.status === TestStepResultStatus.FAILED && !worstTestStepResult.willBeRetried) {
      this.failureCount++
    }
    this.log(`${this.currentScenarioCount}/${this.numberOfScenarios} ${attempt > 0 ? `(try ${attempt + 1})` : ''} ${this.failureCount > 0 ? this.colorFns.forStatus(TestStepResultStatus.FAILED)(`(failed: ${this.failureCount})`) : ''}\n`)
    if(!worstTestStepResult.willBeRetried) {
      this.currentScenarioCount++
    }
  }

  logProgress = (progress) => {
    const { testStepResult, testCaseStartedId, testStepId } = progress
    const { status } = testStepResult
    const character = this.colorFns.forStatus(status)(STATUS_CHARACTER_MAPPING[status])
    this.log(character)
    if(isFailure(testStepResult)) {
      try {
        const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseStartedId)

        const { gherkinDocument, pickle } = testCaseAttempt
        const gherkinStepMap = getGherkinStepMap(gherkinDocument)
        const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(gherkinDocument)
        const pickleStepMap = getPickleStepMap(pickle)

        const failureStep = testCaseAttempt.testCase.testSteps.find(step => step.id === testStepId)

        if(failureStep.pickleStepId) {
          const failureStepData = pickleStepMap[failureStep.pickleStepId]
          const line = gherkinStepMap[failureStepData.astNodeIds[0]].location.line
          this.log(this.colorFns.forStatus(status)(`\nFeature: ${pickle.name} / Step: "${failureStepData.text}" (${pickle.uri}:${line})\n`))
        } else {
          const line = gherkinScenarioLocationMap[pickle.astNodeIds[0]].line
          this.log(this.colorFns.forStatus(status)(`\nBefore/after hook @ scenario: ${pickle.name} (${pickle.uri}:${line}))\n`))
        }
      } catch(e) {
        console.error('Error on formatter', e)
      }
    }
  }

  logIssues({ issues, title }) {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt
        })
      )
    })
  }
}
