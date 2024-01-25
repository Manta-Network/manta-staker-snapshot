import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BindPacificAddress } from "../generated/schema"
import { BindPacificAddress as BindPacificAddressEvent } from "../generated/Staker/Staker"
import { handleBindPacificAddress } from "../src/staker"
import { createBindPacificAddressEvent } from "./staker-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let atlanticAddress = "Example string value"
    let pacificAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newBindPacificAddressEvent = createBindPacificAddressEvent(
      atlanticAddress,
      pacificAddress
    )
    handleBindPacificAddress(newBindPacificAddressEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BindPacificAddress created and stored", () => {
    assert.entityCount("BindPacificAddress", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BindPacificAddress",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "atlanticAddress",
      "Example string value"
    )
    assert.fieldEquals(
      "BindPacificAddress",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pacificAddress",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
