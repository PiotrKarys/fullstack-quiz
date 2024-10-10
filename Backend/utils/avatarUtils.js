const initials = require("initials");

function generateRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function generateInitialsAvatar(initials, backgroundColor) {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${backgroundColor}"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">${initials}</text></svg>`;
}

module.exports = {
  initials,
  generateRandomColor,
  generateInitialsAvatar,
};
