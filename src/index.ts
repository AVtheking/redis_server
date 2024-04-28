import net from "net";
import { queue } from "./constants";
import { Decoder } from "./resp_protocol/Decoder";
import { Encoder } from "./resp_protocol/Encoder";

import { operations } from "./type";
import { handleGet } from "./utils/get";
import { handleSet } from "./utils/set";

//Variable to check if the command is in pipeline or not
export let isPipeline = false;
// function to handle the get operation

// function to handle the exec operation
function handleExec(): string[] {
  let responses: any = [];
  queue.forEach((command: string[]) => {
    const response = handleOperaitons(command);
    responses.push(Decoder.parse(response));
  });
  return responses;
}

//function to handle all operations of redis
function handleOperaitons(parseCommand: unknown): string {
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
      ``;

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
        const responses = handleExec();
        operationResponse = Encoder.encode(responses);
        console.log(operationResponse);
        break;
      }
    default:
      operationResponse = Encoder.encode("ERROR");

      break;
  }
  return operationResponse;
}
// const decoder = new Decoder();
//TCP Server
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const parseCommand = Decoder.parse(data.toString());
    if (parseCommand === null) {
      const response = Encoder.encode("ERROR");
      socket.write(response);
    }
    if (Array.isArray(parseCommand)) {
      const response = handleOperaitons(parseCommand);
      //send response to the client
      socket.write(response);
    }
  });
});

server.on("connection", () => {
  console.log("New connection");
});
//Server listening on port 6372
server.listen(6379, "0.0.0.0");
