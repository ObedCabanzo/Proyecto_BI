//Post de opinion
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const postPredecir = async (opiniones) => {
  console.log(opiniones);
  try {
    const response = await axios.post(`${BASE_URL}/predecir`, {data: opiniones});
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

