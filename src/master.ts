import { Socket } from "node:dgram";
import net from "node:net";
import { Decoder } from "./resp_protocol/Decoder";
import { Encoder } from "./resp_protocol/Encoder";
import { RDB } from "./constants";
import { handleOperaitons } from ".";
import { Database } from "./type";

export class Master {
  port: number;
  replicationId: string;
  offset: number;
  masterInfo: string[];
  dataStore: Database;

  constructor(
    port: number,
    replicationId: string,
    offset: number,
    masterInfo: string[]
  ) {
    this.port = port;
    this.replicationId = replicationId;
    this.offset = offset;
    this.masterInfo = masterInfo;
    this.dataStore = new Map();
  }

  initializeMaster() {
    const server = net.createServer((socket: net.Socket) => {
      console.log("\x1b[32mMaster server initialized\x1b[0m");

      socket.on("data", (data) => {
        const parseCommand = Decoder.parse(data.toString());

        if (parseCommand === null) {
          const response = Encoder.encode("ERROR");
          socket.write(response);
        }
        if (Array.isArray(parseCommand)) {
          //turn the first element of the array to uppercase
          parseCommand[0] = parseCommand[0].toUpperCase();

          const response = handleOperaitons(
            parseCommand,
            socket,
            this.dataStore
          );

          //send response to the client

          socket.write(response);

          if (response.includes("FULLRESYNC")) {
            const emptyRDB = Buffer.from(RDB, "base64").toString("binary");
            const secondResponse = Encoder.encode(emptyRDB);
            const length = secondResponse.length;

            socket.write(`$${length}\r\n${emptyRDB}`);
          }
        }
      });
    });

    server.on("connection", () => {
      console.log("\x1b[32mNew Connection\x1b[0m");
    });
    server.listen(this.port, "0.0.0.0", () => {
      console.log(
        `\x1b[35mMaster server listening on port ${this.port}\x1b[0m`
      );
    });
  }
}
