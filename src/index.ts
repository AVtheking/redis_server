import net from "net";
import { RDB, queue } from "./constants";
import { Decoder } from "./resp_protocol/Decoder";
import { Encoder } from "./resp_protocol/Encoder";

import { operations } from "./type";
import { handleGet } from "./utils/get";
import { handleSet } from "./utils/set";
import { ReplicaInstance } from "./replica";
import { parse } from "path";

//Variable to check if the command is in pipeline or not
export let isPipeline = false;
// function to handle the get operation

const args = process.argv;
console.log(args);
let role = "master";
let port = 6379;
let master: string;
let masterPort: number;
let replicationId = "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
let offset = 0;
let masterInfo: string[] = [];
export const replicaConnection: net.Socket[] = [];

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--port" || "--p":
      port = parseInt(args[i + 1]);

      i += 1;
      break;

    case "--replicaof":
      role = "slave";
      masterInfo = args[i + 1].split(" ");
      i += 1;
      break;
  }
}

//*extracting the address and port of the master
if (role === "slave") {
  master = masterInfo[0];
  masterPort = parseInt(masterInfo[1]);

  const replica = new ReplicaInstance(master, masterPort, port);
  replica.initiateHandshake();
}

// function to handle the exec operation
function handleExec(connection: net.Socket): string[] {
  let responses: any = [];
  queue.forEach((command: string[]) => {
    try {
      const response = handleOperaitons(command, connection);
      responses.push(Decoder.parse(response));
    } catch (error: unknown) {
      console.log(error);
    }
  });
  return responses;
}

//function to handle all operations of redis
function handleOperaitons(
  parseCommand: unknown,
  connection: net.Socket
): string {
  const operation = (parseCommand as string[])[0].toUpperCase();

  let operationResponse: string;

  switch (operation) {
    case operations.ping:
      operationResponse = Encoder.encode("PONG");
      break;

    case operations.echo:
      operationResponse = Encoder.encode((parseCommand as string[])[1]);
      break;

    case operations.set:
      operationResponse = handleSet(parseCommand);
      break;

    case operations.get:
      operationResponse = handleGet(parseCommand);
      break;

    case operations.multi:
      if (isPipeline) {
        return Encoder.encode("ERR MULTI calls can not be nested");
      }
      isPipeline = true;
      operationResponse = Encoder.encode("OK");
      break;

    case operations.exec:
      if (isPipeline) {
        isPipeline = false;
        const responses = handleExec(connection);
        operationResponse = Encoder.encode(responses);

        break;
      }
    case operations.info:
      let response = [
        `role:${role}`,
        `replicationId:${replicationId}`,
        `offset:${offset}`,
      ].join("\r\n");

      operationResponse = Encoder.encode(response);
      break;

    case operations.replconf:
      operationResponse = Encoder.encode("OK");
      break;

    case operations.psync:
      operationResponse = Encoder.encode(`FULLRESYNC ${replicationId} 0`);
      replicaConnection.push(connection);
      break;

    default:
      operationResponse = Encoder.encode("ERROR");

      break;
  }
  return operationResponse;
}

//TCP Server
const server = net.createServer((socket: net.Socket) => {
  socket.on("data", (data) => {
    const parseCommand = Decoder.parse(data.toString());

    if (parseCommand === null) {
      const response = Encoder.encode("ERROR");
      socket.write(response);
    }
    if (Array.isArray(parseCommand)) {
      const response = handleOperaitons(parseCommand, socket);

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
  console.log("New connection");
});
//Server listening on port 6372
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on  ${port}`);
});
