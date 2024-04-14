export function serializeMessage(message: any): string {
  if (typeof message === "string") {
    return `$${message.length}\r\n${message}\r\n`;
  } else if (typeof message === "number") {
    return `:${message}\r\n`;
  } else if (message === null) {
    return "$-1\r\n";
  } else if (Array.isArray(message)) {
    let serialized = `*${message.length}\r\n`;
    for (const item of message) {
      serialized += serializeMessage(item);
    }
    return serialized;
  } else {
    throw new Error(`Cannot serialize message `);
  }
}
