/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../theme';
import {MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {CalendarDaysIcon, MapPinIcon} from 'react-native-heroicons/solid';
import {useCallback, useEffect, useState} from 'react';
import {debounce} from 'lodash';
import {fetchLocation, fetchWeatherForecastData} from '../api/weather';
import {LocationResponse, WeatherData} from '../common/types';
import {weatherImages} from '../constants';
import * as Progress from 'react-native-progress';
import {getData, storeData} from '../utils/asyncStorage';

type WeatherCondition = keyof typeof weatherImages;

export default function HomeScreen() {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loadig, setLoading] = useState(true);

  const handleSearch = (value: string) => {
    console.log('Serarch Term', value);
    if (value.length > 0) {
      fetchLocation({cityName: value}).then((data: LocationResponse[]) => {
        setLocations(data);
      });
    }
  };

  const [weather, setWeather] = useState<WeatherData>();

  const handleLocation = (value: string) => {
    setLocations([]);
    setLoading(true);
    fetchWeatherForecastData({cityName: value, days: '7'}).then(
      (data: WeatherData) => {
        setWeather(data);
        setLoading(false);
        storeData('City', value);
      },
    );
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('City');
    let cityName = 'Mumbai';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecastData({cityName: cityName, days: '7'}).then(
      (data: WeatherData) => {
        setWeather(data);
        setLoading(false);
      },
    );
  };

  return (
    <View className="flex-1 relative">
      <StatusBar barStyle={'light-content'} backgroundColor="#00323a" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        className="w-full h-full absolute"
      />
      {loadig ? (
        <View className="flex-1 flex-col justify-center items-center">
          <Progress.CircleSnail
            thickness={6}
            size={70}
            animating={true}
            color="#0bb3b2"
            direction={'clockwise'}
            spinDuration={1500}
            duration={900}
          />
          <Text className="text-white text-xl mt-5">Loading...</Text>
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {/* Search section */}
          <View className="mx-4 my-4 relative z-50">
            <View
              className="flex-row flex justify-end items-center rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : 'transparent',
              }}>
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  className="flex-row flex w-full text-base pl-6 h-10 flex-1 text-white rounded-full"
                  placeholder="Search City"
                  autoFocus={true}
                  placeholderTextColor={'white'}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => {
                  setShowSearch(!showSearch);
                }}
                style={{backgroundColor: theme.bgWhite(0.3)}}
                className="rounded-full p-3 m-1">
                <MagnifyingGlassIcon size={'18'} color={'white'} />
              </TouchableOpacity>
            </View>

            {showSearch && (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.length > 0 ? (
                  locations.map((loc, index) => {
                    let showBorder = index + 1 !== locations.length;
                    let borderClass = showBorder
                      ? 'border-b-2 border-b-gray-400'
                      : '';
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          handleLocation(loc.name);
                          setShowSearch(false);
                        }}
                        key={index}
                        className={`flex-row items-center border-0 p-3 px-4 ${borderClass}`}>
                        <MapPinIcon size={20} color={'gray'} />
                        <Text className="text-black text-lg ml-2">
                          {`${loc.name}${
                            loc.region ? `, ${loc.region}` : ''
                          }, ${loc.country}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="flex items-center justify-center p-6">
                    <Text className="text-black text-lg font-bold ">
                      No results
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Forcast Section */}
          <ScrollView showsHorizontalScrollIndicator={false}>
            <View className="mx-4 flex justify-around flex-1 mt-7 mb-2">
              {/* location */}
              <Text className="text-white text-center text-2xl font-bold">
                {weather?.location?.name},{' '}
                <Text className="text-lg !text-gray-300">
                  {weather?.location?.country}
                </Text>
              </Text>

              {/* Weather Image */}
              <View className="flex-row mt-7 justify-center">
                <Image
                  // source={{uri: 'http:' + weather?.current.condition.icon}}
                  source={
                    weatherImages[
                      (weather?.current?.condition?.text as WeatherCondition) ??
                        'Partly cloudy'
                    ] ?? {uri: 'http:' + weather?.current.condition.icon}
                  }
                  className="w-52 h-52"
                />
              </View>

              {/* Degree Celcius */}
              <View className="space-y-2 mt-10">
                <Text className="text-center font-bold text-white text-6xl tracking-widest">
                  {weather?.current.temp_c} &#176;C
                </Text>
                <Text className="text-center font-bold text-white text-xl tracking-widest">
                  {weather?.current.condition.text}
                </Text>
              </View>

              {/* Other Stats */}
              <View className="flex-row justify-between mt-9 mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../assets/icons/wind.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {weather?.current.wind_kph} kph
                  </Text>
                </View>

                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../assets/icons/drop.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {weather?.current.humidity}%
                  </Text>
                </View>

                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../assets/icons/sun.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {weather?.forecast.forecastday[0].astro.sunrise}
                  </Text>
                </View>
              </View>

              {/* Forcast for next days */}
              <View className="mb-2 space-y-3 mt-20">
                <View className="flex-row items-center mx-5 space-x-2">
                  <CalendarDaysIcon size="22" color="white" />
                  <Text className=" text-white text-base"> Daily forecast</Text>
                </View>
                <ScrollView
                  horizontal
                  contentContainerStyle={{paddingHorizontal: 15}}
                  showsHorizontalScrollIndicator={false}>
                  {weather?.forecast.forecastday?.map((item, index) => {
                    let date = new Date(item.date);
                    let options: Intl.DateTimeFormatOptions = {weekday: 'long'};
                    let dayName = date.toLocaleDateString('en-US', options);
                    dayName = dayName.split(',')[0];
                    return (
                      <View
                        key={index}
                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                        style={{backgroundColor: theme.bgWhite(0.15)}}>
                        <Image
                          source={
                            weatherImages[
                              (item?.day?.condition
                                ?.text as WeatherCondition) ?? 'Partly cloudy'
                            ] ?? {
                              uri: 'http:' + weather?.current.condition.icon,
                            }
                          }
                          className="h-11 w-11"
                        />
                        <Text className="text-white">{dayName}</Text>
                        <Text className="text-white text-xl font-semibold">
                          {item.day.avgtemp_c} &#176;C
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}
