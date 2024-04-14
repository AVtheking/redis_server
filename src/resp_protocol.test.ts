
import { expect, test } from "vitest";
import { deserializeMessage } from "./deserialize";
import { serializeMessage } from "./serialize";
// Test cases for serializeMessage function
test("Serialize string message", () => {
  expect(serializeMessage("Hello")).toBe("$5\r\nHello\r\n");
});

test("Serialize number message", () => {
  expect(serializeMessage(123)).toBe(":123\r\n");
});

test("Serialize null message", () => {
  expect(serializeMessage(null)).toBe("$-1\r\n");
});

test("Serialize array message", () => {
  expect(serializeMessage(["SET", "mykey", "Hello"])).toBe(
    "*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nHello\r\n"
  );
});

// Test cases for deserializeMessage function
test("Deserialize string message", () => {
  expect(deserializeMessage("+OK\r\n")).toBe("OK");
});

test("Deserialize number message", () => {
  const result = deserializeMessage(":123\r\n");
  expect(deserializeMessage(":123\r\n")).toBe(123);
});

test("Deserialize null message", () => {
  expect(deserializeMessage("$-1\r\n")).toBeNull();
});

test("Deserialize array message", () => {
  const result = deserializeMessage(
    "*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nHello\r\n"
  );
console.log(result)

  expect(
    deserializeMessage("*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$5\r\nHello\r\n")
  ).toEqual(["SET", "mykey", "Hello"]);
});
test("Deserialize invalid message format", () => {
  // Test with an invalid message format (missing prefix)
  expect(() => deserializeMessage("Invalid message")).toThrowError(
    "Invalid RESP message format"
  );
});

test("Deserialize unknown message type", () => {
  // Test with an unknown message type (unsupported prefix)
  expect(() => deserializeMessage("@Unknown\r\n")).toThrowError(
    "Invalid RESP message format"
  );
});

test("Deserialize invalid array message", () => {
  // Test with an invalid array message (missing elements)
  expect(() => deserializeMessage("*2\r\n$3\r\nSET\r\n")).toThrowError(
    "Invalid RESP message format"
  );
});

// Test cases for invalid serialization

test("Serialize unsupported data type", () => {
  // Test with an unsupported data type for serialization
  expect(() => serializeMessage({ key: "value" })).toThrowError(
    `Cannot serialize message`
  );
});
