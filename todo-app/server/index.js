// Note I got some help from this Medium article to understand
// server-side rendering with React
// https://medium.com/simform-engineering/how-to-implement-ssr-server-side-rendering-in-react-18-e49bc43e9531
require("ignore-styles");

require("@babel/register")({
  ignore: [/(node_modules)/],
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

require("./server");