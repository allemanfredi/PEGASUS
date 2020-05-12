import kdbxweb from 'kdbxweb'
import argon2 from 'argon2-browser'
import * as FileSaver from 'file-saver'
import logger from '@pegasus/utils/logger'

kdbxweb.CryptoEngine.argon2 = async (
  _encryptionPassword,
  salt,
  memory,
  iterations,
  length,
  parallelism,
  type,
  version
) => {
  const hash = await argon2.hash({
    pass: new Uint8Array(_encryptionPassword),
    salt: new Uint8Array(salt),
    mem: memory,
    time: iterations,
    hashLen: length,
    parallelism,
    type,
    version
  })

  return hash.hash
}

class SeedVaultController {
  constructor(configs) {
    const { walletController } = configs

    this.walletController = walletController
  }

  /**
   * Create a .kdbx file encrypted with _encryptionPassword
   * after having validated _encryptionPassword
   *
   * @param {String} _loginPassword
   * @param {String} _encryptionPassword
   */
  async createSeedVault(_loginPassword, _encryptionPassword) {
    if (!this.walletController.comparePassword(_loginPassword)) return false

    const account = this.walletController.getCurrentAccount()
    const seed = account.seed

    const credentials = new kdbxweb.Credentials(
      kdbxweb.ProtectedValue.fromString(_encryptionPassword),
      null
    )
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity')

    db.upgrade()
    const entry = db.createEntry(db.getDefaultGroup())
    entry.fields.Title = 'Pegasus Wallet Seed'
    entry.fields.Seed = kdbxweb.ProtectedValue.fromString(seed)

    const vault = await db.save()

    const blob = new Blob([vault])
    FileSaver.saveAs(blob, `pegasus-vault-${account.name}.kdbx`)

    logger.log(
      `(SeedVaulController) Exporting seed into file: pegasus-vault-${account.name}.kdbx`
    )

    return true
  }

  /**
   *
   * Importing a seed encrypted within a .kdbx file.
   * _encodedFile must be parsed
   *
   * @param {Uint8Array} _encodedFile
   * @param {String} _password
   */
  async importSeedVault(_encodedFile, _password) {
    const credentials = new kdbxweb.Credentials(
      kdbxweb.ProtectedValue.fromString(_password),
      null
    )

    const db = await kdbxweb.Kdbx.load(
      Uint8Array.from(Object.values(_encodedFile)).buffer,
      credentials
    )
  }
}

export default SeedVaultController
