const {id, keccak256, defaultAbiCoder, getCreate2Address} = require('ethers/lib/utils')

const saltToHex = (salt) => {
    salt = salt.toLowerCase()
    return (salt.indexOf("0x") !== -1)
        ? salt
        : id(salt.toString())
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

    // add constructor arguments manually, if present
    if(constructorArgs)
        byteCode = buildBytecode(constructorArgs.types, constructorArgs.params, byteCode)

    const saltHex = saltToHex(salt)

    return getCreate2Address(from, saltHex, keccak256(byteCode))
}
