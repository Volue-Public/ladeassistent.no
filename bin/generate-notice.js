const fs = require('node:fs')
const licenseChecker = require('license-checker')

const noticeFile = 'ATTRIBUTIONS.txt'

licenseChecker.init({ start: '.' }, (err, ret) => {
    if (err) {
        console.error('An error occured while checking licenses')
        return
    }
    var fd = null
    try {
        fd = fs.openSync(noticeFile, 'w')
        fs.appendFileSync(
            fd,
            'NOTICE\n\nThis project includes third-party dependencies licensed under the following terms\n\n'
        )
        fs.appendFileSync(fd, 'Summary of third-party licences:\n')
        fs.appendFileSync(fd, `${licenseChecker.asSummary(ret)}\n`)

        for (const [packageName, info] of Object.entries(ret)) {
            fs.appendFileSync(fd, `${'-'.repeat(80)}\n`)
            fs.appendFileSync(fd, `${packageName}\n\n`)
            if (info.licenses) {
                fs.appendFileSync(fd, `LICENSE: ${info.licenses}\n`)
            }
            if (info.repository) {
                fs.appendFileSync(fd, `REPOSITORY: ${info.repository}\n`)
            }
            if (info.licenseFile) {
                fs.appendFileSync(fd, `\n${fs.readFileSync(info.licenseFile)}`)
            }
            fs.appendFileSync(fd, '\n')
        }
    } finally {
        if (fd != null) {
            fs.closeSync(fd)
        }
    }
})
