
import { configure_experiment, expect_to_fail, get_account, set_mockup, set_mockup_now } from "@completium/experiment-ts";

import { competition } from './binding/competition'
import { Address, Key, Nat, Tez } from "@completium/archetype-ts-types";

// import assert from 'assert'

/* Accounts ---------------------------------------------------------------- */

const organizer = get_account('bootstrap2');
const alice = get_account('alice');
// const bob = get_account('bob');

const prize = new Tez(10)
const now = new Date(Date.now());
const oracle = new Key("edpkv9k8WZNMyEMuLLVwQfGDqm4pfxSEkTmvgq5DakPUnNbNnQuB14")
const init_submission: Array<[ Address, [ Nat, Date ]]> = [
  [new Address("tz1Lc2qBKEWCBeDU8npG6zCeCqpmaegRi6Jg"), [new Nat(5432), now]],
  [new Address("tz1UUHt41ukVHcamQ5YZgGWsm6mXasVBt6Ln"), [new Nat(10354), now]],
  [new Address("tz1XZ7s6uStC2hZVpPQhXgcdXPwxifByF3Ao"), [new Nat(15624), now]],
  [new Address("tz1YwPJUNoU9qQTtFtsg6mjWUGSkXtf2uDHc"), [new Nat(1644), now]],
  [new Address("tz1ZAQXACaEqryobpBoLbJUc2DjG5ZzrhARu"), [new Nat(874), now]],
  [new Address("tz1ZXf37ZNfVupt5GVyrPJ76q8kbjFuD2z7R"), [new Nat(236), now]],
  [new Address("tz1cck7sNvM3TWkUA9VGWnyBW44uxMLz9vGg"), [new Nat(688), now]],
]

/* Initialisation ---------------------------------------------------------- */

describe('Initialisation', () => {
  it('Configure experiment', async () => {
    await configure_experiment({
      account: 'alice',
      endpoint: 'mockup',
      quiet: true,
    });
  });
  it('set_mockup', () => {
    set_mockup()
    // await mockup_init()
  });
  it('set_mockup_now', () => {
    set_mockup_now(now)
  });
})

/* Scenario ---------------------------------------------------------------- */

describe('[COMPETITION] Contract deployment', () => {
  it('Deploy test_binding', async () => {
    await competition.deploy(organizer.get_address(), prize, oracle, init_submission, { as: organizer })
  });
})

describe('[COMPETITION] Call entry', () => {
  it("Call 'confirm'", async () => {
    await expect_to_fail(async () => {
      await competition.confirm({ as: alice })
    }, competition.errors.INVALID_CALLER)
  })
})
