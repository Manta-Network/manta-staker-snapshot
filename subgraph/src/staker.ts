import {
  BindPacificAddress as BindPacificAddressEvent,
  Initialized as InitializedEvent,
} from "../generated/Staker/Staker";
import { BindPacificAddress, Initialized } from "../generated/schema";

export function handleBindPacificAddress(event: BindPacificAddressEvent): void {
  let entity = new BindPacificAddress(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.atlanticAddress = event.params.atlanticAddress.toHexString();
  entity.pacificAddress = event.params.pacificAddress;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.version = event.params.version;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
