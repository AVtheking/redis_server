import { dataMap } from "../constants";

export function handleExpiry(
  expiryTimeCommand: string,
  expiryTimeValue: number,
  key: string,
  value: string
) {
  if (expiryTimeCommand && expiryTimeValue) {
    switch (expiryTimeCommand) {
      //case for the expiry time in seconds
      case "EX":
        const ttl = Date.now() + expiryTimeValue * 1000;
        dataMap.set(key, { value, expiryTime: ttl });
        break;
      //case for the expiry time in milliseconds
      case "PX":
        const ttlInMilliseconds = Date.now() + expiryTimeValue;
        dataMap.set(key, { value, expiryTime: ttlInMilliseconds });
        break;

      default:
        dataMap.set(key, { value, expiryTime: undefined });
        break;
    }
  } else {
    dataMap.set(key, { value, expiryTime: undefined });
  }
}
