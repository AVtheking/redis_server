import { dataMap } from "../constants";
import { Encoder } from "../resp_protocol/Encoder";

/*
  * Function to handle the get operation
  * @param parseCommand - the parsed command
  * @returns if the key is present and is not expired then return the value of the key
  
*/

export function handleGet(parseCommand: unknown) {
  const getKey = (parseCommand as string)[1];

  //extract the value from the map
  const data: { value: string; expiryTime?: number } | undefined =
    dataMap.get(getKey);
  //value of the key
  const keyValue = data?.value;
  //expiry time of the key
  const expiryTime = data?.expiryTime;

  //if the key is present and is not yet expired
  if (keyValue && (!expiryTime || expiryTime > Date.now())) {
    return Encoder.encode(keyValue);
  } else {
    //if the key is expired then delete it from the cache
    if (keyValue) {
      dataMap.delete(getKey);
    }
    return Encoder.encode(null);
  }
}
