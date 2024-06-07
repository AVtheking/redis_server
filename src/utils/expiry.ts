import { Database } from "../type";

//implementing functionality of expiry time in O(1) time complexity
export function handleExpiry(
  expiryTimeCommand: string,
  expiryTimeValue: number,
  key: string,
  value: string,
  dataStore: Database
) {
  if (expiryTimeCommand && expiryTimeValue) {
    expiryTimeCommand.toUpperCase();

    switch (expiryTimeCommand) {
      //case for the expiry time in seconds
      case "EX":
        const ttl = Date.now() + expiryTimeValue * 1000;
        dataStore.set(key, { value, expiryTime: ttl });
        break;
      //case for the expiry time in milliseconds
      case "PX":
        const ttlInMilliseconds = Date.now() + expiryTimeValue;
        dataStore.set(key, { value, expiryTime: ttlInMilliseconds });
        break;

      default:
        dataStore.set(key, { value, expiryTime: undefined });
        break;
    }
  } else {
    dataStore.set(key, { value, expiryTime: undefined });
  }
}
