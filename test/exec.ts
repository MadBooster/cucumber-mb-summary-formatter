import {
  IConfiguration,
  loadConfiguration,
  runCucumber,
} from '@cucumber/cucumber/api'
import * as glob from 'glob'
import { join } from 'path'
import { PassThrough } from 'stream'
import * as streamToString from 'stream-to-string'
import { promisify } from 'util'

export const run = async (
  fileName: string,
  cucumberOptions: Partial<IConfiguration> = {},
  throws = false
): Promise<string> => {
  // clear require cache for support code
  const matches = await promisify(glob)('features/support/*', {
    absolute: true,
    cwd: __dirname,
  })
  matches.forEach((match) => delete require.cache[match])

  const configuration: Partial<IConfiguration> = {
    ...cucumberOptions,
    format: [join(__dirname, '..', 'index.js')],
    paths: [join('test', 'features', fileName)],
    require: [join(__dirname, 'features')],
  }
  const { runConfiguration } = await loadConfiguration({
    provided: configuration,
  })
  const stdout = new PassThrough()
  const stderr = new PassThrough()
  try {
    await runCucumber(runConfiguration, {
      cwd: join(__dirname, '..', '..'),
      stdout,
      stderr,
    })
  } catch (ex) {
    if (throws) {
      throw ex
    }
  }
  stdout.end()
  stderr.end()
  const result = await streamToString(stdout)
  return result.replace(/\d+m\d+\.\d+s/g, '0m00.000s')
}
