//Post de opinion
const BASE_URL = process.env.REACT_APP_API_URL;
export const postOpinion = async (opinion) => {
  try {
    const response = await axios.post(`${BASE_URL}/opinions`, opinion);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

