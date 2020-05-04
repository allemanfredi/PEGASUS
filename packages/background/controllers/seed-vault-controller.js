import kdbxweb from 'kdbxweb'
import argon2 from 'argon2-browser'
import * as FileSaver from 'file-saver'
import logger from '@pegasus/utils/logger'

class SeedVaultController {
  constructor(configs) {
    const { walletController } = configs

    this.walletController = walletController
  }

  async createSeedVault(_loginPassword, _encryptionPassword) {
    if (!this.walletController.comparePassword(_loginPassword)) return false

    const account = this.walletController.getCurrentAccount()
    const seed = account.seed

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
}

export default SeedVaultController
