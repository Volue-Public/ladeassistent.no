const licenseChecker = require('license-checker')
const process = require('node:process')

const packageJson = require('../package.json')
const dependencies = packageJson.dependencies
const devDependencies = packageJson.devDependencies

licenseChecker.init({ start: '.' }, async (err, ret) => {
    if (err) {
        console.log('Unable to check licenses')
        return
    }

    for (const [nameAndVersion, info] of Object.entries(ret)) {
        const versionIndex = nameAndVersion.lastIndexOf('@')
        const name = nameAndVersion.substring(0, versionIndex)
        const version = nameAndVersion.substring(versionIndex + 1)
        if (!(name in dependencies || name in devDependencies)) {
            continue
        }

        console.log(`${'-'.repeat(80)}`)
        console.log('Name:', name)
        console.log('Version:', version)
        if (info.repository) {
            console.log('Repository:', info.repository)
            githubIndex = info.repository.toLowerCase().indexOf('github.com/')
            if (githubIndex > 0) {
                const repo = info.repository.substring(githubIndex + 11)
                const githubApi = `https://api.github.com/repos/${repo}`

                const license = ['LICENSE', 'LICENSE.md'].find(
                    async (f) => await pageExists(info.repository + '/' + f)
                )
                if (license) {
                    console.log(`License file: ${info.repository}/${license}`)
                } else {
                    const licenseJson = await fetchJson(`${githubApi}/license`)
                    if (licenseJson && 'html_url' in licenseJson) {
                        console.log('License file:', licenseJson.html_url)
                    } else {
                        console.error('No htm_url in:', licenseJson)
                    }
                }

                const repoJson = await fetchJson(githubApi)
                if (repoJson && 'description' in repoJson) {
                    console.log(`Description: "${repoJson.description}"`)
                } else {
                    console.error('No description in:', repoJson)
                }
            } else {
                console.error('Failed to get license for:', info.repository)
            }
        }
    }
})

async function pageExists(url) {
    try {
        const res = await fetch(url, { method: 'HEAD' })
        return res.ok
    } catch (e) {
        console.error('Failed fetch head for url:', url, e)
        return false
    }
}

async function fetchJson(url) {
    try {
        const headers = process.env.GITHUB_TOKEN
            ? [['Authorization', 'Bearer ' + process.env.GITHUB_TOKEN]]
            : []
        const res = await fetch(url, { headers })
        if (res.ok) {
            return await res.json()
        } else {
            console.error('Got unexpected response from url:', url, res)
        }
    } catch (e) {
        console.error('Failed fetch json from url:', url, e)
    }
}
