import { formatterHelpers, type IFormatterOptions, SummaryFormatter } from '@cucumber/cucumber'
import * as messages from '@cucumber/messages'

import { formatIssue, isFailure } from './issue_helpers.js'

const { parseTestCaseAttempt } = formatterHelpers

const STATUS_CHARACTER_MAPPING =
  new Map<messages.TestStepResultStatus, string>([
    [messages.TestStepResultStatus.AMBIGUOUS, 'A'],
    [messages.TestStepResultStatus.FAILED, 'F'],
    [messages.TestStepResultStatus.PASSED, '.'],
    [messages.TestStepResultStatus.PENDING, 'P'],
    [messages.TestStepResultStatus.SKIPPED, '-'],
    [messages.TestStepResultStatus.UNDEFINED, 'U'],
  ])

export default class MbSummaryFormatter extends SummaryFormatter {
  private numberOfSteps: number
  private numberOfScenarios: number
  private currentScenarioCount: number
  private failureCount: number
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', this.parseEnvelope)
    this.numberOfSteps = 0
    this.numberOfScenarios = 0
    this.currentScenarioCount = 1
    this.failureCount = 0
  }

  parseEnvelope = (envelope: messages.Envelope) => {
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

  incrementStepCount = (testCase: messages.TestCase) => {
    this.numberOfSteps += testCase.testSteps.length
    this.numberOfScenarios++
  }

  logStepProgress = (testCaseFinished: messages.TestCaseFinished): void => {
    const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
    const { attempt, worstTestStepResult, willBeRetried } = testCaseAttempt
    if(worstTestStepResult.status === messages.TestStepResultStatus.FAILED && !willBeRetried) {
      this.failureCount++
    }
    this.log(`${this.currentScenarioCount}/${this.numberOfScenarios} ${attempt > 0 ? `(try ${attempt + 1})` : ''} ${this.failureCount > 0 ? this.colorFns.forStatus(messages.TestStepResultStatus.FAILED)(`(failed: ${this.failureCount})`) : ''}\n`)
    if(!willBeRetried) {
      this.currentScenarioCount++
    }
  }

  logProgress = (progress: messages.TestStepFinished): void => {
    const { testStepResult, testCaseStartedId, testStepId } = progress
    const { status } = testStepResult
    const character = this.colorFns.forStatus(status)(STATUS_CHARACTER_MAPPING.get(status)!)
    this.log(character)
    if(isFailure(testStepResult)) {
      try {
        const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseStartedId)

        const a = parseTestCaseAttempt({ testCaseAttempt, snippetBuilder: this.snippetBuilder, supportCodeLibrary: this.supportCodeLibrary })
        const pickleName = a.testCase.name
        const pickleUrl = a.testCase.sourceLocation?.uri
        const pickleLine = a.testCase.sourceLocation?.line
        // const stepText = a.testSteps.find(step => step.)
        // const { gherkinDocument, pickle } = testCaseAttempt
        // const gherkinStepMap = getGherkinStepMap(gherkinDocument)
        // const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(gherkinDocument)
        // const pickleStepMap = getPickleStepMap(pickle)
        const failureStep = testCaseAttempt.testCase.testSteps.find(step => step.id === testStepId)

        const failureSteps = a.testSteps.filter(step => isFailure(step.result))

        if(failureStep?.pickleStepId) {
          // const failureStepData = pickleStepMap[failureStep.pickleStepId]
          // const line = gherkinStepMap[failureStepData.astNodeIds[0]].location.line
          const firstFailureStep = failureSteps[0]
          this.log(this.colorFns.forStatus(status)(`\nFeature: ${pickleName} / Step: "${failureSteps.map(step => step.text).join('\n')}" (${pickleUrl}:${firstFailureStep.sourceLocation?.line})\n`))
        } else {
          // const line = gherkinScenarioLocationMap[pickle.astNodeIds[0]].line
          this.log(this.colorFns.forStatus(status)(`\nBefore/after hook @ scenario: ${pickleName} (${pickleUrl}:${pickleLine}))\n`))
        }
      } catch(e) {
        console.error('Error on formatter', e)
      }
    }
  }

  logIssues({ issues, title }: Parameters<SummaryFormatter['logIssues']>[0]): void {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
          printAttachments: this.printAttachments,
        })
      )
    })
  }
}
