import JSEncrypt from 'jsencrypt';
const APP_PRIVATE_KEY = `
    -----BEGIN RSA PRIVATE KEY-----
    MIICXAIBAAKBgQCCg8h9ME5z0vTjbkApBdcKyGUB2L+rGjbfyu4oF/HeTnoKZecm
    x9WH5d04whkSzp45MWYn3HJjMxQrHj2iLe5nntb4jm0rSCDtcV7piIF1dqjD8KRq
    eVIIPYzbL585x4g1avHJz/7M70N5xsfcvzbg9eApku46EoEI4e5WuSttlQIDAQAB
    AoGAUcunrhXFRT+z7IlfOpaHZCGddB/UV7aRJ4Z15bjEA/Ao+jVNPffFsmr0TysO
    LcRCU1PLUzYMlnEftbo5JFgm7fKVXFXI58wqWHsktx5oxniuZVW9/YHRa3GnQPU7
    9UKDYnBsdIMXMXMsaJgweo3oZyIb62gvJTNRwsOV11mN920CQQDBr0/75kg4TmrH
    HnXe2cNMnf59RZ814Kh1l2W8Sqvsz8m0Bp/ZG/zNIOUd4sPVXjxhu0HJ1Xo3oy4f
    UW8g+8E/AkEArIGGCRX4RyAGFkCpfqMMCdaHHytXNB3qTgJ4FX1dCtcBY+rAwepL
    lY+v+XJ9dwNpgdglK/oIIkau/cVbISgIKwJAKOhwSlH/GvVlFB1Y4/K2jy4nnCni
    UKzcp8mMUVKsMV5Jyd5EUMTahjDWc5N7rUs0EahNYuXV5H5wtWirwhmqXQJBAKpK
    0r51absM6fVdr/TLkD7GAG3MozFXts17sn/EWe0xgrXYMKE9YZArYFSnqSOrwqPj
    dA6NrSnpDSaHhQaeNjECQH+PDUiDUMxSqhldxLNJgofdt3kO8GDfQPXy/exPt3yS
    Ecv5cozcfFJ0Yko1+opJL+hQXj0sG5eGLmw4X2cS98s=
    -----END RSA PRIVATE KEY----- 
`
export const decryptLongMessage = (encryptedChunks) => {
    const decrypt = new JSEncrypt()
    decrypt.setPrivateKey(APP_PRIVATE_KEY)
    const list = encryptedChunks.split('+token+')
    return list.map((chunk) => decrypt.decrypt(chunk)).join('')
}

export const compareVersions = (version1: string, version2: string): number => {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    // Compare each version segment
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1Part = v1Parts[i] || 0 // Default to 0 if segment is missing
        const v2Part = v2Parts[i] || 0 // Default to 0 if segment is missing

        if (v1Part > v2Part) {
            return 1 // version1 is greater than version2
        }
        if (v1Part < v2Part) {
            return -1 // version1 is less than version2
        }
    }
    return 0 // Both versions are equal
}