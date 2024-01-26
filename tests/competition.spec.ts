
import { configure_experiment, expect_to_fail, get_account, set_mockup, set_mockup_now } from "@completium/experiment-ts";

import { competition } from './binding/competition'

// import assert from 'assert'

/* Accounts ---------------------------------------------------------------- */

const alice = get_account('alice');

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
    set_mockup_now(new Date(Date.now()))
  });
})

/* Scenario ---------------------------------------------------------------- */

describe('[COMPETITION] Contract deployment', () => {
  it('Deploy test_binding', async () => {
    await competition.deploy(new Date(), { as: alice })
  });
})

describe('[COMPETITION] Call entry', () => {
  it("Call 'confirm'", async () => {
    await expect_to_fail(async () => {
      await competition.confirm({ as: alice })
    }, competition.errors.INVALID_CALLER)
  })
})
