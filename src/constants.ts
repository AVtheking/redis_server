//Map to store the key-value pair
export const dataMap = new Map<
  string,
  { value: string; expiryTime?: number }
>();
//Queue to store the commands in case of pipeline
export const queue: any = [];
