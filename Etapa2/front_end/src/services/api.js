//Post de opinion
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const postPredecir = async (json) => {
  try {
    const response = await axios.post(`${BASE_URL}/predecir`, json);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const postReentrenar = async (json) => {
  try {
    const response = await axios.post(`${BASE_URL}/reentrenar`, json);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}



