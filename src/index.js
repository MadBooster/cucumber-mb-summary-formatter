import SummaryFormatter from '@cucumber/cucumber/lib/formatter/summary_formatter'
import { isFailure } from '@cucumber/cucumber/lib/formatter/helpers/issue_helpers'
import Status from '@cucumber/cucumber/lib/status'

const STATUS_CHARACTER_MAPPING = {
  [Status.AMBIGUOUS]: 'A',
  [Status.FAILED]: 'F',
  [Status.PASSED]: '.',
  [Status.PENDING]: 'P',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: 'U'
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
    if(envelope.pickle != null) {
      this.incrementStepCount(envelope.pickle)
    } else if(envelope.testStepFinished != null) {
      this.logProgress(envelope.testStepFinished)
    } else if(envelope.testCaseFinished != null) {
      this.logStepProgress(envelope.testCaseFinished)
    } else if(envelope.testRunFinished != null) {
      this.log('\n\n')
    }
  }

  incrementStepCount = (pickle) => {
    this.numberOfSteps += pickle.steps.length
    this.numberOfScenarios++
  }

  logStepProgress = (testCaseFinished) => {
    const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
    const { attempt, worstTestStepResult } = testCaseAttempt
    if(worstTestStepResult.status === Status.FAILED && !worstTestStepResult.willBeRetried) {
      this.failureCount++
    }
    this.log(`${this.currentScenarioCount}/${this.numberOfScenarios} ${attempt > 0 ? `(try ${attempt + 1})` : ''} ${this.failureCount > 0 ? this.colorFns.forStatus(Status.FAILED)(`(failed: ${this.failureCount})`) : ''}\n`)
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
        const failureStep = testCaseAttempt.testCase.testSteps.find(step => step.id === testStepId)
        const failureStepData = testCaseAttempt.pickle.steps.find(step => step.id === failureStep.pickleStepId)
        const failurePickleAstNodeId = testCaseAttempt.pickle.astNodeIds[0]
        const failureScenario = testCaseAttempt.gherkinDocument.feature.children.find(scenario => (scenario.scenario ? scenario.scenario.id : scenario.background.id) === failurePickleAstNodeId)
        if(failureStep && failureStep.pickleStepId) {
          const failureStepAstData = failureScenario.scenario.steps.find(step => step.id === failureStepData.astNodeIds[0])
          this.log(this.colorFns.forStatus(status)(`\nFeature: ${testCaseAttempt.pickle.name} / Step: "${failureStepData.text}" (${testCaseAttempt.pickle.uri}:${failureStepAstData.location.line})\n`))
        } else {
          const failureScenarioAstData = (failureScenario.scenario ? failureScenario.scenario : failureScenario.background)
          this.log(this.colorFns.forStatus(status)(`\nBefore/after hook @ scenario: ${testCaseAttempt.pickle.name} (${testCaseAttempt.pickle.uri}:${failureScenarioAstData.location.line}))\n`))
        }
      } catch(e) {
        console.error('Error on formatter', e)
      }
    }
  }
}
