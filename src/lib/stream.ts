import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.STREAM_PUBLIC_KEY;
const apiSecret = process.env.STREAM_PRIVATE_KEY;

if (!apiKey || !apiSecret) {
    throw new Error("Missing Stream API keys");
}

export const streamServerClient = new StreamClient(apiKey, apiSecret);

export const generateUserToken = (userId: string) => {
    return streamServerClient.createToken(userId);
};
