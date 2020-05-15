function encrypt(receiverPublicKey, msgParams) {  //: string
  const ephemeralKeyPair = nacl.box.keyPair()
  const pubKeyUInt8Array =  nacl.util.decodeBase64(receiverPublicKey)
  const msgParamsUInt8Array = nacl.util.decodeUTF8(msgParams)
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const encryptedMessage = nacl.box(
    msgParamsUInt8Array,
    nonce,
    pubKeyUInt8Array,
    ephemeralKeyPair.secretKey
  )
  return {
    ciphertext: nacl.util.encodeBase64(encryptedMessage),
    ephemPubKey: nacl.util.encodeBase64(ephemeralKeyPair.publicKey),
    nonce: nacl.util.encodeBase64(nonce),
    version: "x25519-xsalsa20-poly1305"
  }
}
