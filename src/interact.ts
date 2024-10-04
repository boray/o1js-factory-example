import { AccountUpdate, Mina, PrivateKey } from 'o1js';
import { Factory } from './Factory.js';
import { Add } from './Add.js';

const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

let tx;
let [bob] = Local.testAccounts;

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
let factory_contract = new Factory(zkAppAddress);

if (Local.proofsEnabled) {
  console.time('compile contract');
  await Factory.compile();
  console.timeEnd('compile contract');
}

console.time('deploy factory');
tx = await Mina.transaction(bob, async () => {
  AccountUpdate.fundNewAccount(bob);
  await factory_contract.deploy();
})
  .prove()
  .sign([bob.key, zkAppPrivateKey])
  .send();
console.log(tx.toPretty());
console.timeEnd('deploy factory');

console.time('deploy an add contract');
const newKeypair = PrivateKey.randomKeypair();
const newAddress = newKeypair.publicKey;
tx = await Mina.transaction(bob, async () => {
  AccountUpdate.fundNewAccount(bob);
  await factory_contract.deployAdd(newAddress);
})
  .sign([bob.key, newKeypair.privateKey])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('deploy an add contract');

console.time('update add contract state');
const add_contract = new Add(newAddress);
tx = await Mina.transaction(bob, async () => {
  await add_contract.update();
})
  .sign([bob.key])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('update add contract state');

console.time('deploy another add contract');
const anotherNewKeypair = PrivateKey.randomKeypair();
const anotherNewAddress = anotherNewKeypair.publicKey;
tx = await Mina.transaction(bob, async () => {
  AccountUpdate.fundNewAccount(bob);
  await factory_contract.deployAdd(anotherNewAddress);
})
  .sign([bob.key, anotherNewKeypair.privateKey])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('deploy another add contract');

console.time('update another add contract state');
const another_add_contract = new Add(newAddress);
tx = await Mina.transaction(bob, async () => {
  await another_add_contract.update();
})
  .sign([bob.key])
  .prove()
  .send();
console.log(tx.toPretty());
console.timeEnd('update another add contract state');
