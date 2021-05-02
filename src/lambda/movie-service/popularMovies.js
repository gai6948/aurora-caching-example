const postgres = require("postgres");
const AWS = require("aws-sdk");

const {
    DB_SECRETS_ID,
    POSTGRES_HOST,
  } = process.env;      

exports.popularMovies = async () => {
    const secretsManager = new AWS.SecretsManager();
  try {
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
    await sql`SELECT * FROM movies ORDER BY popularity DESC LIMIT 10 OFFSET ${cursor};`.stream(row => movieList.push(row));
    console.log(movieList);
    const payload = { ...movieList };
    await sql.end({ timeout: 0 });
    return JSON.stringify({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: payload,        
    });
  } catch (err) {
    console.error(err);
    await sql.end();
    return JSON.stringify({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: err,
    });
  }
};
