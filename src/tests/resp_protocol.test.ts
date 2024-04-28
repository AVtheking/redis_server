import { expect, test } from "vitest";
import { Decoder } from "../resp_protocol/Decoder";
import { Encoder } from "../resp_protocol/Encoder";
// Test cases for serializeMessage function
test("Serialize string message", () => {
  expect(Encoder.createBulkString("Hello")).toBe("$5\r\nHello\r\n");
});

test("Serialize number message", () => {
  expect(Encoder.createInteger(123)).toBe(":123\r\n");
});

test("Serialize null message", () => {
  expect(Encoder.createErrorMessage(null)).toBe("$-1\r\n");
});

test("Serialize array message", () => {
  expect(
    Encoder.createArray(["$3\r\nSET\r\n", "$5\r\nmykey\r\n", "$5\r\nHello\r\n"])
  ).toBe("*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nHello\r\n");
});

// Test cases for deserializeMessage function
test("Deserialize string message", () => {
  expect(Decoder.parse("+OK\r\n")).toBe("OK");
});

test("Deserialize number message", () => {
  const result = Decoder.parse(":123\r\n");
  expect(Decoder.parse(":123\r\n")).toBe(123);
});

test("Deserialize null message", () => {
  expect(Decoder.parse("$-1\r\n")).toBeNull();
});

test("Deserialize array message", () => {
  const result = Decoder.parse(
    "*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nHello\r\n"
  );
  console.log(result);

  expect(
    Decoder.parse("*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nHello\r\n")
  ).toEqual(["SET", "mykey", "Hello"]);
});
test("Deserialize invalid message format", () => {
  // Test with an invalid message format (missing prefix)
  expect(() => Decoder.parse("Invalid message")).toThrowError(
    "Invalid RESP message format"
  );
});

test("Deserialize unknown message type", () => {
  // Test with an unknown message type (unsupported prefix)
  expect(() => Decoder.parse("@Unknown\r\n")).toThrowError(
    "Invalid RESP message format"
  );
});

test("Deserialize invalid array message", () => {
  // Test with an invalid array message (missing elements)
  expect(() => Decoder.parse("*2\r\n$3\r\nSET\r\n")).toThrowError(
    "Invalid RESP message format"
  );
});

// Test cases for invalid serialization

// test("Serialize unsupported data type", () => {
//   // Test with an unsupported data type for serialization
//   expect(() => Encoder.({ key: "value" })).toThrowError(
//     `Cannot serialize message`
//   );
// });
