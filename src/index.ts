import net from "net";
import { dataMap, queue } from "./constants";
import { deserializeMessage } from "./deserialize";
import { handleSet } from "./handleSetOperation";
import { serializeMessage } from "./serialize";
import { operations } from "./type";

//Variable to check if the command is in pipeline or not
export let isPipeline = false;
// function to handle the get operation
function handleGet(parseCommand: unknown) {
  const getKey = (parseCommand as string)[1];

  //extract the value from the map
  const data: { value: string; expiryTime?: number } | undefined =
    dataMap.get(getKey);
  //value of the key
  const keyValue = data?.value;
  //expiry time of the key
  const expiryTime = data?.expiryTime;

  if (keyValue && (!expiryTime || expiryTime > Date.now())) {
    return serializeMessage(keyValue);
  } else {
    if (keyValue) {
      dataMap.delete(getKey);
    }
    return serializeMessage(null);
  }
}
// function to handle the exec operation
function handleExec(): string[] {
  let responses: any = [];
  queue.forEach((command: string[]) => {
    const response = handleOperaitons(command);
    responses.push(deserializeMessage(response));
  });
  return responses;
}

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

//function to handle all operations of redis
function handleOperaitons(parseCommand: unknown): string {
  const operation = (parseCommand as string[])[0].toUpperCase();
  let operationResponse: string;

  switch (operation) {
    case operations.ping:
      operationResponse = serializeMessage("PONG");
      break;

    case operations.echo:
      operationResponse = serializeMessage((parseCommand as string[])[1]);
      break;

    case operations.set:
      operationResponse = handleSet(parseCommand);
      break;

    case operations.get:
      operationResponse = handleGet(parseCommand);
      break;

    case operations.multi:
      let isPipelineActive = isPipeline;
      if (isPipelineActive) {
        return serializeMessage("ERR MULTI calls can not be nested");
      }
      isPipelineActive = true;
      operationResponse = serializeMessage("OK");
      break;

    //case for the EXEC command of the pipeline
    case operations.exec:
      if (isPipeline) {
        isPipeline = false;
        const responses = handleExec();
        operationResponse = serializeMessage(responses);
        console.log(operationResponse);
        break;
      }
    default:
      operationResponse = serializeMessage("ERROR");

      break;
  }
  return operationResponse;
}
//TCP Server
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const parseCommand = deserializeMessage(data.toString());
    if (parseCommand === null) {
      const response = serializeMessage("ERROR");
      socket.write(response);
    }
    if (Array.isArray(parseCommand)) {
      const response = handleOperaitons(parseCommand);
      console.log(response);
      socket.write(response);
    }
  });
});

server.on("connection", () => {
  console.log("New connection");
});
//Server listening on port 6372
server.listen(6379, "0.0.0.0");
