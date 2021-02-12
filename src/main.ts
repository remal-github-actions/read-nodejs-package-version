import * as core from '@actions/core'
import * as fs from 'fs'
import path from 'path'
import SemVer from 'semver/classes/semver'
import semver from 'semver/preload'
import workspacePath from './internal/workspacePath'

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

async function run(): Promise<void> {
    try {
        const packageFile = core.getInput('packageFile', {required: true})
        core.info(`Parsing ${packageFile}`)

        const packageAbsoluteFile = path.resolve(workspacePath, packageFile)
        const content = fs.readFileSync(packageAbsoluteFile, 'utf8')
        const packageInfo = JSON.parse(content)

        const version = packageInfo.version
        if (!version) {
            core.setFailed('Version is not set or empty')
            return
        }

        const semverVersion: SemVer | null = semver.parse(version)
        if (semverVersion == null) {
            core.setFailed(`Version isn't a valid semantic version (can't be parsed by semver library): ${version}`)
            return
        }

        core.setOutput('version', semverVersion.toString())

        const prereleaseSuffix: string = (function () {
            const prerelease = semverVersion.prerelease.join('.')
            return prerelease.length > 0 ? `-${prerelease}` : ''
        })()

        const patchVer = [semverVersion.major, semverVersion.minor, semverVersion.patch].join('.') + prereleaseSuffix
        core.info(`Patch version: ${patchVer}`)
        core.setOutput('patchVersion', patchVer)

        const minorVer = [semverVersion.major, semverVersion.minor].join('.') + prereleaseSuffix
        core.info(`Minor version: ${minorVer}`)
        core.setOutput('minorVersion', minorVer)

        const majorVer = [semverVersion.major].join('.') + prereleaseSuffix
        core.info(`Major version: ${majorVer}`)
        core.setOutput('majorVersion', majorVer)

    } catch (error) {
        core.setFailed(error)
    }
}

//noinspection JSIgnoredPromiseFromCall
run()
