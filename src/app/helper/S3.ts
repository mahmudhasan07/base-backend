import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    endpoint: process.env.DO_SPACE_ENDPOINT,
    region: "nyc3", // Replace with your region
    credentials: {
        accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "", // Store in .env for security
        secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "", // Store in .env for security
    },
});