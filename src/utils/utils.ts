import cryptoJS from "crypto-js";
import HmacSHA256 from 'crypto-js/hmac-sha256'
import Base64 from 'crypto-js/enc-base64'
// Encryption function
function jm(text, key) {
    // Encrypt using AES
    const ciphertext = cryptoJS.AES.encrypt(text, key).toString();
    return ciphertext;
}

// Decryption function
function ujm(ciphertext, key) {
    // Decrypt using AES
    const bytes = cryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(cryptoJS.enc.Utf8);
    return originalText;
}
const jmt = 'U2FsdGVkX180P2EkFfAAAKa72j7VxN9AzcskkULBFoA6X7UTDN500MquwczQtjOSMwJS6Jm5/laCzrJs+j0OAQ==';

/**
 * Generate checksum from an object
 * @param {Object} obj - Object to generate checksum from
 * @param {Array} sortedKeys - Keys to extract
 * @returns {string} Generated checksum
 */
const generateChecksum = (obj: Record<string, any>, sortedKeys: string[]): string => {
    let concatenatedString = '';
    // Concatenate key-value pairs
    for (const key of sortedKeys) {
        concatenatedString += key + JSON.stringify(obj[key]);
    }
    // Generate hash using MD5 as checksum
    const checksum = cryptoJS.MD5(concatenatedString).toString();
    return checksum;
}

// Decode Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
}
// Play audio
const playBase64Audio = async (base64Data: string) => {
    // Play audio
    const audioCtx = new AudioContext()
    const arrayBuffer = base64ToArrayBuffer(base64Data)
    // Decode ArrayBuffer to AudioBuffer
    const audioBufferPromise = audioCtx.decodeAudioData(arrayBuffer)
    audioBufferPromise
        .then((audioBuffer) => {
            if (!audioBuffer) {
                console.error('Error decoding audio data')
                return
            }
            // Create AudioBufferSourceNode and connect to context.destination (speaker)
            const source = audioCtx.createBufferSource()
            source.buffer = audioBuffer
            // Set source node end event for resource cleanup
            source.onended = () => {
                source.disconnect(audioCtx.destination)
            }
            // Start playback
            source.connect(audioCtx.destination)
            source.start(0)
        })
        .catch((error) => {
            console.error('Error loading audio:', error)
        })
}
// Get WebSocket URL
const getWebSocketUrl = (Key, Secret) => {
    let url = 'wss://iat-api.xfyun.cn/v2/iat'
    // var host = 'iat-api.xfyun.cn'
    const host = ''
    const k = ujm(Key, jmt)
    const s = ujm(Secret, jmt)
    const date = new Date().toUTCString()
    const algorithm = 'hmac-sha256'
    const headers = 'host date request-line'
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = HmacSHA256(signatureOrigin, s)
    const signature = Base64.stringify(signatureSha)
    const authorizationOrigin = `api_key="${k}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
    return url
}
export { generateChecksum, base64ToArrayBuffer, getWebSocketUrl, playBase64Audio, jm, ujm, jmt}