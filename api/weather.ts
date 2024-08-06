import axios from 'axios';
import {apiKey} from '../constants';

type RequestParams = {
  cityName?: string;
  days?: string;
};

const forecastEndpoint = (
  params: RequestParams,
) => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no
`;

const searchEndpoint = (
  params: RequestParams,
) => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}
  `;

const apiCall = async (endpoint: string) => {
  const optoins = {
    method: 'GET',
    url: endpoint,
  };

  try {
    const apiResponse = await axios.request(optoins);
    return apiResponse.data;
  } catch (error) {
    console.log('Error: ', error);
    return null;
  }
};

export const fetchWeatherForecastData = (params: RequestParams) => {
  let forecastUrl = forecastEndpoint(params);
  return apiCall(forecastUrl);
};

export const fetchLocation = (params: RequestParams) => {
  let forecastUrl = searchEndpoint(params);
  return apiCall(forecastUrl);
};
