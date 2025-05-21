import 'should'

import { run, stepsSupportPath } from './exec.js'

describe('Step', () => {
  it('logs steps', async() => {
    const result = await run('step.feature', { name: ['Step name'] })
    result.should.containEql(
      '.....1/1  \n' +
      '1 scenario (1 passed)\n' +
      '5 steps (5 passed)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('warns about ambiguous steps', async() => {
    const result = await run('step.feature', { name: ['Ambiguous step'] })
    result.should.containEql(
      'A\n' +
      'Feature: Ambiguous step / Step: "ambiguous" (test/features/step.feature:15)\n' +
      '1/1  \n' +
      'Failures:\n' +
      '\n' +
      '1) Scenario: Ambiguous step # test/features/step.feature:14\n' +
      '   ✖ When ambiguous\n' +
      '       Multiple step definitions match:\n' +
      `         ambiguous - ${stepsSupportPath}:7\n` +
      `         ambiguous - ${stepsSupportPath}:8\n` +
      '\n' +
      '1 scenario (1 ambiguous)\n' +
      '1 step (1 ambiguous)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('warns about failed steps', async() => {
    const result = await run('step.feature', { name: ['Failed step'] })
    result.should.match(new RegExp(
      'F\\n' +
      'Feature: Failed step / Step: "failed" \\(test/features/step.feature:18\\)\\n' +
      '1/1  \\(failed: 1\\)\\n' +
      'Failures:\\n' +
      '\\n' +
      '1\\) Scenario: Failed step # test/features/step.feature:17\\n' +
      `   ✖ When failed # ${stepsSupportPath}:9\\n` +
      '       Error: FAILED\\n' +
      '           at World\\.<anonymous> \\(.*:\\d+:\\d+\\)\\n' +
      '\\n' +
      '1 scenario \\(1 failed\\)\\n' +
      '1 step \\(1 failed\\)\\n' +
      '0m00\\.000s \\(executing steps: 0m00\\.000s\\)\\n' +
      '\\n' +
      '\\n'
    ))
  })

  it('logs passed steps', async() => {
    const result = await run('step.feature', { name: ['Passed step'] })
    result.should.containEql(
      '.1/1  \n' +
      '1 scenario (1 passed)\n' +
      '1 step (1 passed)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('logs pending steps', async() => {
    const result = await run('step.feature', { name: ['Pending step'] })
    result.should.containEql(
      'P1/1  \n' +
      'Warnings:\n' +
      '\n' +
      '1) Scenario: Pending step # test/features/step.feature:23\n' +
      `   ? When pending # ${stepsSupportPath}:13\n` +
      '       Pending\n' +
      '\n' +
      '1 scenario (1 pending)\n' +
      '1 step (1 pending)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('logs skipped steps', async() => {
    const result = await run('step.feature', { name: ['Skipped step'] })
    result.should.containEql(
      '-1/1  \n' +
      '1 scenario (1 skipped)\n' +
      '1 step (1 skipped)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('logs undefined steps', async() => {
    const result = await run('step.feature', { name: ['Undefined step'] })
    result.should.containEql(
      'U\n' +
      'Feature: Undefined step / Step: "undefined" (test/features/step.feature:30)\n' +
      '1/1  \n' +
      'Failures:\n' +
      '\n' +
      '1) Scenario: Undefined step # test/features/step.feature:29\n' +
      '   ? When undefined\n' +
      '       Undefined. Implement with the following snippet:\n' +
      '\n' +
      '         When(\'undefined\', function () {\n' +
      '           // Write code here that turns the phrase above into concrete actions\n' +
      '           return \'pending\';\n' +
      '         });\n' +
      '\n' +
      '\n' +
      '1 scenario (1 undefined)\n' +
      '1 step (1 undefined)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('logs errors', async() => {
    const result = await run('step.feature', { name: ['Failed step'] })
    result.should.match(new RegExp(
      'F\\n' +
      'Feature: Failed step / Step: "failed" \\(test/features/step.feature:18\\)\\n' +
      '1/1  \\(failed: 1\\)\\n' +
      'Failures:\\n' +
      '\\n' +
      '1\\) Scenario: Failed step # test/features/step.feature:17\\n' +
      `   ✖ When failed # ${stepsSupportPath}:9\\n` +
      '       Error: FAILED\\n' +
      '           at World\\.<anonymous> \\(.*:\\d+:\\d+\\)\\n' +
      '\\n' +
      '1 scenario \\(1 failed\\)\\n' +
      '1 step \\(1 failed\\)\\n' +
      '0m00\\.000s \\(executing steps: 0m00\\.000s\\)\\n' +
      '\\n' +
      '\\n'
    ))
  })

  it('logs docString errors', async() => {
    const result = await run('step.feature', { name: ['Failed docString'] })
    result.should.match(new RegExp(
      'F\\n' +
      'Feature: Failed docString / Step: "failing doc string:" \\(test/features/step.feature:40\\)\\n' +
      '1/1  \\(failed: 1\\)\\n' +
      'Failures:\\n' +
      '\\n' +
      '1\\) Scenario: Failed docString # test/features/step.feature:39\\n' +
      `   ✖ Given failing doc string: # ${stepsSupportPath}:16\\n` +
      '       """\\n' +
      '       Some multiline\\n' +
      '       Text\\n' +
      '       """\\n' +
      '       Error: FAILED\\n' +
      '           at World\\.<anonymous> \\(.*:\\d+:\\d+\\)\\n' +
      '\\n' +
      '1 scenario \\(1 failed\\)\\n' +
      '1 step \\(1 failed\\)\\n' +
      '0m00.000s \\(executing steps: 0m00.000s\\)\\n' +
      '\\n' +
      '\\n'
    ))
  })

  it('logs dataTable errors', async() => {
    const result = await run('step.feature', { name: ['Failed dataTable'] })
    result.should.match(new RegExp(
      'F\\n' +
      'Feature: Failed dataTable / Step: "failing data table:" \\(test/features/step.feature:52\\)\\n' +
      '1/1  \\(failed: 1\\)\\n' +
      'Failures:\\n' +
      '\\n' +
      '1\\) Scenario: Failed dataTable # test/features/step.feature:51\\n' +
      `   ✖ Given failing data table: # ${stepsSupportPath}:20\\n` +
      '       | a | b |' +
      '       | c | d |' +
      '       Error: FAILED\\n' +
      '           at World\\.<anonymous> \\(.*:\\d+:\\d+\\)\\n' +
      '\\n' +
      '1 scenario \\(1 failed\\)\\n' +
      '1 step \\(1 failed\\)\\n' +
      '0m00\\.000s \\(executing steps: 0m00\\.000s\\)\\n' +
      '\\n' +
      '\\n'
    ))
  })
})
