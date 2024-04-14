export function deserializeMessage(message: String): unknown {
  if (message.startsWith("+")) {
    return message.slice(1, message.indexOf("\r\n"));
  } else if (message.startsWith("-")) {
    return message.slice(1, message.indexOf("\r\n"));
  } else if (message.startsWith(":")) {
    //return the number that is passed in the resp protocol
    return parseInt(message.slice(1, message.indexOf("\r\n")));
  } else if (message.startsWith("$")) {
    const length = parseInt(message.slice(1, message.indexOf("\r\n")));
    if (length === -1) {
      return null;
    }
    const index = message.indexOf("\r\n") + 2;
    const remMsg = message.slice(index);
    // console.log(remMsg);
    const command = remMsg.slice(0, remMsg.indexOf("\r\n"));
    // console.log(command)

    return command;
  }
  //case for the array message
  else if (message.startsWith("*")) {
    const messageLength = parseInt(message.slice(1, message.indexOf("\r\n")));
    console.log(messageLength);
    let resArr = [];
    let index = message.indexOf("\r\n") + 2;
    let remMsg = message.slice(index);

    for (let i = 0; i < messageLength; i++) {
      resArr.push(deserializeMessage(remMsg));

      index = remMsg.indexOf("\r\n") + 2;
      remMsg = remMsg.slice(index);
      console.log(`remMsg: ${remMsg}`);
      index = remMsg.indexOf("\r\n") + 2;
      remMsg = remMsg.slice(index);
    }
    return resArr;
  } else {
    throw new Error("Invalid RESP message format");
  }
}
export function parseSimpleString(message: string): string {
  return message.slice(1, message.indexOf("\r\n"));
}
export function parseError(message: string): string {
  return message.slice(1, message.indexOf("\r\n"));
}
export function parseInteger(message: string): number {
  return parseInt(message.slice(1, message.indexOf("\r\n")));
}
