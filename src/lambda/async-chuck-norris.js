// example of async handler using async-await
// https://github.com/netlify/netlify-lambda/issues/43#issuecomment-444618311

import axios from "axios";
export async function handler(event, context) {
  try {
    const response = await axios.get(
      "https://api.chucknorris.io/jokes/random",
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText };
    }
    const data = response.data;

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: data.value })
    };
  } catch (err) {
    console.log(err); // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    };
  }
}
