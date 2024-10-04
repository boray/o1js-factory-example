import {
  SmartContract,
  Permissions,
  method,
  PublicKey,
  Bool,
  AccountUpdate,
  Provable,
} from 'o1js';
import { Add } from './Add.js';

/**
 * Factory Example
 */

const { verificationKey } = await Add.compile();

export class Factory extends SmartContract {
  init() {
    super.init();
  }

  @method async deployAdd(address: PublicKey) {
    const update = AccountUpdate.createSigned(address);
    update.body.update.verificationKey = {
      isSome: Bool(true),
      value: { data: verificationKey.data, hash: verificationKey.hash },
    };
    update.body.update.permissions = {
      isSome: Bool(true),
      value: {
        ...Permissions.default(),
      },
    };
  }
}
