import { handleExpiry, isPipeline } from ".";
import { queue } from "./constants";
import { serializeMessage } from "./serialize";

//function to handle the set operation
export function handleSet(parseCommand: unknown): string {
  if (isPipeline) {
    const array = parseCommand as string[];

    queue.push(array);

    return serializeMessage("QUEUED");
  }
  if ((parseCommand as string).length < 3) {
    return serializeMessage("ERROR wrong number of arguments");
  }
  const key = (parseCommand as string)[1];
  const value = (parseCommand as string)[2];
  const expiryTimeCommand = (parseCommand as string)[3];
  const expiryTimeValue: number = parseInt((parseCommand as string)[4]);

  //function to handle the case for the expiry time
  handleExpiry(expiryTimeCommand, expiryTimeValue, key, value);
  return serializeMessage("OK");
}
