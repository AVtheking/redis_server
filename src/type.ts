import { info } from "console";

export const operations = {
  set: "SET",
  get: "GET",
  del: "DEL",
  incr: "INCR",
  decr: "DECR",
  exists: "EXISTS",
  echo: "ECHO",
  ping: "PING",
  multi: "MULTI",
  exec: "EXEC",
  info: "INF",
  replconf: "REPLCONF",
  psync: "PSYNC",
};

export type Database = Map<
  string,
  { value: string; expiryTime: number | undefined }
>;
