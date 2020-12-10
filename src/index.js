const {toUtf8Bytes, keccak256, defaultAbiCoder, getCreate2Address} = require('ethers/lib/utils')

const saltToHex = (salt) => {
    salt = salt.toLowerCase()
    return (salt.indexOf("0x") === -1)
        ? keccak256(toUtf8Bytes(salt.toString()))
        : salt
}

const encodeParams = (dataTypes, data) => {
    return defaultAbiCoder.encode(dataTypes, data)
}

const buildBytecode = (
    constructorTypes,
    constructorArgs,
    contractBytecode,
) => {
    return `${contractBytecode}${encodeParams(constructorTypes, constructorArgs).slice(
        2,
    )}`
}

exports.calculateCreate2 = (from, salt, byteCode, constructorArgs) => {

    // make sure we have 0x
    byteCode = '0x' + byteCode.replace('0x', '')

    if(constructorArgs && byteCode.length === 66)
        throw new Error('You can\'t pass in constructor arguments, and byte code as hash!', byteCode, constructorArgs)

    // add constructor arguments manually, if present
    if(constructorArgs)
        byteCode = buildBytecode(constructorArgs.types, constructorArgs.params, byteCode)

    // dont hash it if its already a hash
    byteCode = (byteCode.length !== 66)
        ? keccak256(byteCode)
        : byteCode

    const saltHex = saltToHex(salt)

    return getCreate2Address(from, saltHex, byteCode)
}
