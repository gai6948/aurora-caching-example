const { popularMovies } = require("./popularMovies");

exports.lambdaHandler = async (event, context, callback) => {
  console.log(event);

  switch (event.rawPath) {
    case '/popularMovies':
      return popularMovies();
    default:
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json"
        },
        body: `Unrecognized path: ${event.rawPath}`
      };
  }
};
