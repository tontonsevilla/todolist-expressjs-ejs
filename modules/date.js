exports.getDate = function () {
  const dateOptions = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return new Date().toLocaleDateString("en-US", dateOptions);
}

exports.getDay = function () {
  const dateOptions = {
    weekday: "long"
  };

  return new Date().toLocaleDateString("en-US", dateOptions);
}
