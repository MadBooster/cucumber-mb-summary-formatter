import 'should'

import { run, stepsSupportPath } from './exec.js'

describe('Background', () => {
  it('logs backgrounds', async() => {
    const result = await run('background.feature', { name: ['Background scenario', 'Background scenario outline'] })
    result.should.startWith(
      '...1/3  \n' +
      '...2/3  \n' +
      '...3/3  \n' +
      '3 scenarios (3 passed)\n' +
      '9 steps (9 passed)\n' +
      '0m00.000s (executing steps: 0m00.000s)\n' +
      '\n' +
      '\n'
    )
  })

  it('logs backgrounds on failed step', async() => {
    const result = await run('background.feature', { name: ['Failing step with background scenario'] })

    result.should.match(new RegExp(
      '.F\\n' +
      'Feature: Failing step with background scenario / Step: "failed" \\(test/features/background.feature:20\\)\\n' +
      '1/1  \\(failed: 1\\)\\n' +
      'Failures:\\n' +
      '\\n' +
      '1\\) Scenario: Failing step with background scenario # test/features/background.feature:19\\n' +
      `   ✔ Given noop # ${stepsSupportPath}:5\\n` +
      `   ✖ Given failed # ${stepsSupportPath}:9\\n` +
      '       Error: FAILED\\n' +
      '           at World\\.<anonymous> \\(.*:\\d+:\\d+\\)\\n' +
      '\\n' +
      '1 scenario \\(1 failed\\)\\n' +
      '2 steps \\(1 failed, 1 passed\\)\\n' +
      '0m00.000s \\(executing steps: 0m00.000s\\)\\n' +
      '\\n' +
      '\\n'
    ))
  })

  it('logs failing backgrounds', async() => {
    const result = await run('background2.feature')
    result.should.match(new RegExp(
      'F\\n' +
      'Feature: Failing background scenario / Step: "failed" \\(test/features/background2.feature:4\\)\\n' +
      '--1/1  \\(failed: 1\\)\\n' +
      'Failures:\\n' +
      '\\n' +
      '1\\) Scenario: Failing background scenario # test/features/background2.feature:6\\n' +
      `   ✖ Given failed # ${stepsSupportPath}:9\\n` +
      '       Error: FAILED\\n' +
      '           at World\\.<anonymous> \\(.*:\\d+:\\d+\\)\\n' +
      `   - When noop # ${stepsSupportPath}:5\\n` +
      `   - Then noop # ${stepsSupportPath}:5\\n` +
      '\\n' +
      '1 scenario \\(1 failed\\)\\n' +
      '3 steps \\(1 failed, 2 skipped\\)\\n' +
      '0m00.000s \\(executing steps: 0m00.000s\\)\\n' +
      '\\n' +
      '\\n'
    ))
  })
})
