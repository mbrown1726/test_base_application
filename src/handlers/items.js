const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.create = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const item = { id: randomUUID(), createdAt: new Date().toISOString(), ...body };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

  return {
    statusCode: 201,
    body: JSON.stringify(item),
  };
};

exports.get = async (event) => {
  const { id } = event.pathParameters;

  const result = await ddb.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );

  if (!result.Item) {
    return { statusCode: 404, body: JSON.stringify({ message: "Not found" }) };
  }

  return { statusCode: 200, body: JSON.stringify(result.Item) };
};
