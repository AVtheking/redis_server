import { connect } from "node:http2";
import { isPipeline, replicaConnection } from "..";
import { queue } from "../constants";
import { Encoder } from "../resp_protocol/Encoder";

import { handleExpiry } from "./expiry";
import { Database } from "../type";

//function to handle the set operation
export function handleSet(parseCommand: unknown, dataStore: Database): string {
  if (isPipeline) {
    const array = parseCommand as string[];

    queue.push(array);

    return Encoder.encode("QUEUED");
  }
  if ((parseCommand as string).length < 3) {
    return Encoder.encode("ERROR wrong number of arguments");
  }
  const key = (parseCommand as string)[1];
  const value = (parseCommand as string)[2];
  const expiryTimeCommand = (parseCommand as string)[3];

  const expiryTimeValue: number = parseInt((parseCommand as string)[4]);

  //function to handle the case for the expiry time
  handleExpiry(expiryTimeCommand, expiryTimeValue, key, value, dataStore);
  replicaConnection.forEach((connection) => {
    connection.write(Encoder.encode(parseCommand));
  });
  return Encoder.encode("OK");
}
