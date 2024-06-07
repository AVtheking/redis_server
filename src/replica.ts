import net from "node:net";
import { Encoder } from "./resp_protocol/Encoder";
import { Decoder } from "./resp_protocol/Decoder";
import { Database } from "./type";
import { handleOperaitons } from ".";

enum WriteCommands {
  SET = "SET",
  DEL = "DEL",
}

const writeCommands = new Set(Object.values(WriteCommands));

export class ReplicaInstance {
  masterHost: string;
  masterPort: number;
  port: number;
  store: Database;

  constructor(masterHost: string, masterPort: number, port: number) {
    this.masterHost = masterHost;
    this.masterPort = masterPort;
    this.port = port;
    this.store = new Map();
  }

  initiateHandshake() {
    try {
      const replica = net.createConnection(
        { port: this.masterPort, host: this.masterHost },
        () => {
          console.log("\x1b[31mConnected to master \x1b[0m");
        }
      );
      console.log(`\x1b[32mPinging ${this.masterPort}....\x1b[0m`);
      replica.write(Encoder.encode(["PING"]));

      replica.on("data", (data) => {
        const response = Decoder.parse(data.toString());

        if (response === "PONG") {
          console.log(`\x1b[33mREPLCONF ${this.masterPort}...\x1b[0m`);
          replica.write(
            Encoder.encode([`REPLCONF`, `listening-port`, `${this.port}`])
          );
          console.log(`\x1b[33mREPLCONF 2 ${this.masterPort}....\x1b[0m`);

          replica.write(Encoder.encode([`REPLCONF`, `capa`, `psync2`]));
        } else if (response === "OK") {
          replica.write(Encoder.encode(["PSYNC", "?", "-1"]));
        } else if (Array.isArray(response)) {
          if (writeCommands.has(response[0])) {
            console.log(
              `\x1b[33m Recived write command ${response[0]} from master\x1b[0m`
            );
            handleOperaitons(response, replica, this.store);
          }
        } else {
          console.log(
            `\x1b[35m Recived RDB file: ${response} from master\x1b[0m`
          );
        }
      });

      replica.on("end", () => {
        console.log("Disconnected from master");
      });

      replica.on("error", (error) => {
        console.log(error);
      });
    } catch (error) {
      console.log(error);
    }
  }
}
