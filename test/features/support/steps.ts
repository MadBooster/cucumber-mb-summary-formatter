import { DataTable, Given } from '@cucumber/cucumber'

import { World } from './World'

const noop = () => {}

Given('noop', noop)
Given('noop {string}', (_: string) => {})
Given('ambiguous', noop)
Given('ambiguous', noop)
Given('failed', () => {
  throw new Error('FAILED')
})
Given('passed', noop)
Given('pending', () => 'pending')
Given('skipped', () => 'skipped')
Given('doc string:', (_: string) => {})
Given('failing doc string:', (_: string) => {
  throw new Error('FAILED')
})
Given('data table:', (_: DataTable) => {})
Given('failing data table:', (_: DataTable) => {
  throw new Error('FAILED')
})
Given('world', function (this: World) {
  this.someWorldMethod()
})
