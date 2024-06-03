import net from "node:net";
import { Encoder } from "./resp_protocol/Encoder";
import { Decoder } from "./resp_protocol/Decoder";
import { database } from "./type";

enum WriteCommands {
  SET = "SET",
  DEL = "DEL",
}

const writeCommands = new Set(Object.values(WriteCommands));

export class ReplicaInstance {
  masterHost: string;
  masterPort: number;
  port: number;
  store: Map<string, database>;

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
          console.log("Connected to master");
        }
      );
      replica.write(Encoder.encode(["PING"]));

      replica.on("data", (data) => {
        const response = Decoder.parse(data.toString());

        if (response === "PONG") {
          replica.write(
            Encoder.encode([`REPLCONF`, `listening-port`, `${this.port}`])
          );
          replica.write(Encoder.encode([`REPLCONF`, `capa`, `psync2`]));
        } else if (response === "OK") {
          replica.write(Encoder.encode(["PSYNC", "?", "-1"]));
        } else if (Array.isArray(response)) {
          if (writeCommands.has(response[0])) {
            console.log(`response from master: ${response}`);
          }
        }

        // console.log(response);
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
