export class Encoder {
  //parent method to encode the message
  //encapuslating and abstracting the encoding logic
  static encode(message: string) {
    //separate case for the message "Ok"
    //it is encoded as a simple string
    if (message === "Ok") {
      return this.createSimpleString(message);
    }
    const type = typeof message;

    //encoding the message based on the type of the message in resp protocol
    switch (type) {
      //if the message is a string
      case "string":
        return this.createBulkString(message);
      //encoding for the case of a number
      case "number":
        return this.createInteger(parseInt(message));
      //encoding for the case of null|array
      case "object":
        if (message === null) {
          return this.createErrorMessage(null);
        } else if (Array.isArray(message)) {
          return this.createArray(message);
        } else {
          throw new Error(`Cannot serialize message `);
        }
      default:
        throw new Error(`Cannot serialize message `);
    }
  }
  static createBulkString(message: string): string {
    return `$${message.length}\r\n${message}\r\n`;
  }
  static createSimpleString(message: string): string {
    return `+${message}\r\n`;
  }
  static createErrorMessage(message: null) {
    return "$-1\r\n";
  }
  static createInteger(message: number) {
    return `:${message}\r\n`;
  }
  static createArray(arr: Array<string>) {
    return `*${arr.length}\r\n${arr.join("")}`;
  }
}
