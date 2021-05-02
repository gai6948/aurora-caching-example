const postgres = require("postgres");
const AWS = require("aws-sdk");
const Redis = require("ioredis");

const { DB_SECRETS_ID, POSTGRES_HOST, REDIS_HOST } = process.env;

const redisKey = "movies:top10movies";

exports.popularMovies = async () => {
  const secretsManager = new AWS.SecretsManager();
  const r = new Redis(6379, REDIS_HOST, {});
  try {
    console.log("Trying cache...");
    const movies = await r.get(redisKey);
    if (movies != null) {
        console.log("Cache hit");
        const buff = Buffer.from(movies, "base64");
        const movieList = JSON.parse(buff.toString("ascii"));
        console.log(movieList);
        const payload = { ...movieList };
        return JSON.stringify({
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: payload,
          });    
    } else {
      console.log("Trying to fetch databse secrets");
      const sm = await secretsManager
        .getSecretValue({ SecretId: DB_SECRETS_ID })
        .promise();
      const dbCredentials = JSON.parse(sm.SecretString);
      const pgConfig = {
        host: POSTGRES_HOST,
        user: dbCredentials.username,
        database: dbCredentials.dbname,
        password: dbCredentials.password,
        port: dbCredentials.port,
        timeout: 3,
        ssl: false,
      };
      const sql = postgres(pgConfig);
      console.log("Trying to connect Aurora");
      const cursor = 0;
      const movieList = [];
      await sql`SELECT * FROM movies ORDER BY popularity DESC LIMIT 10 OFFSET ${cursor};`.stream(
        (row) => movieList.push(row)
      );
      console.log(movieList);
      console.log("Populating cache...");
      const encodedVal = Buffer.from(JSON.stringify(movieList));
      r.set(redisKey, encodedVal.toString("base64"), "EX", 60);
      const payload = { ...movieList };
      await sql.end({ timeout: 0 });
      return JSON.stringify({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });
    }
  } catch (err) {
    console.error(err);
    await sql.end();
    return JSON.stringify({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: err,
    });
  }
};
