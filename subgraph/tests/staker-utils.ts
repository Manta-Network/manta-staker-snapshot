import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { BindPacificAddress, Initialized } from "../generated/Staker/Staker"

export function createBindPacificAddressEvent(
  pacificAddress: Address,
  atlanticAddress: string
): BindPacificAddress {
  let bindPacificAddressEvent = changetype<BindPacificAddress>(newMockEvent())

  bindPacificAddressEvent.parameters = new Array()

  bindPacificAddressEvent.parameters.push(
    new ethereum.EventParam(
      "pacificAddress",
      ethereum.Value.fromAddress(pacificAddress)
    )
  )
  bindPacificAddressEvent.parameters.push(
    new ethereum.EventParam(
      "atlanticAddress",
      ethereum.Value.fromString(atlanticAddress)
    )
  )

  return bindPacificAddressEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}
