//This class is decoding the message send in the resp protocol
export class Decoder {
  //parse function
  static parse(message: string): any {
    const symbol = message.slice(0, 1);

    switch (symbol) {
      case "+":
        return this.readSimpleString(message);

      case "-":
        return this.readNull(message);

      case ":":
        return this.readNumber(message);

      case "$":
        return this.readBulkString(message);

      case "*":
        return this.readArray(message);

      default:
        throw new Error("Invalid RESP message format");
    }
  }
  static readSimpleString(message: string): string {
    return message.slice(1, message.indexOf("\r\n"));
  }
  static readBulkString(message: string): string | null {
    const length = parseInt(message.slice(1, message.indexOf("\r\n")));
    if (length === -1) {
      return null;
    }

    //TODO: this part also needs improvement
    const index = message.indexOf("\r\n") + 2;
    const remMsg = message.slice(index);

    const command = remMsg.slice(0, remMsg.indexOf("\r\n"));
    return command;
  }

  static readNull(message: string): null {
    return null;
  }
  static readNumber(message: string): number {
    return parseInt(message.slice(1, message.indexOf("\r\n")));
  }
  static readArray(message: string) {
    const messageLength = parseInt(message.slice(1, message.indexOf("\r\n")));
    let resArr = [];
    let index = message.indexOf("\r\n") + 2;
    let remMsg = message.slice(index);

    for (let i = 0; i < messageLength; i++) {
      const commmand = this.parse(remMsg);

      resArr.push(this.parse(remMsg));

      //TODO:this code needs improvement
      index = remMsg.indexOf("\r\n") + 2;
      remMsg = remMsg.slice(index);
      index = remMsg.indexOf("\r\n") + 2;
      remMsg = remMsg.slice(index);
    }
    return resArr;
  }
}
