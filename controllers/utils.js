function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

function failureResponse(res, error, statusCode = 500) {
  return res.status(statusCode).json(error);
}

module.exports = {
  successResponse,
  failureResponse,
};
