import React, { useEffect, useState } from "react";
import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  requestPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";

import api from "../../services/api";

import { MaterialIcons } from "@expo/vector-icons";

import {
  MapViewStyle,
  Avatar,
  DevDetails,
  CalloutStyle,
  SearchForm,
  SearchInput,
  LoadButton,
} from "./styles";

export default function Main({ navigation }) {
  const [currentRegion, setCurrentRegion] = useState(null);
  const [devs, setDevs] = useState([]);
  const [techs, setTechs] = useState("");

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync();

      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true,
        });

        const { latitude, longitude } = coords;

        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    }

    loadInitialPosition();
  }, []);

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;

    const { data } = await api.get("/search", {
      params: { latitude, longitude, techs },
    });

    setDevs(data);
  }

  function handleRegionChange(region) {
    setCurrentRegion(region);
  }

  if (!currentRegion) {
    return null;
  }

  return (
    <>
      <MapView
        onRegionChangeComplete={handleRegionChange}
        initialRegion={currentRegion}
        style={MapViewStyle}
      >
        {devs.map(dev => (
          <Marker
            key={dev._id}
            coordinate={{
              longitude: dev.location.coordinates[0],
              latitude: dev.location.coordinates[1],
            }}
          >
            <Image source={{ uri: dev.avatar_url }} style={Avatar} />

            <Callout
              onPress={() =>
                navigation.navigate("Profile", {
                  github_username: dev.github_username,
                })
              }
            >
              <View style={CalloutStyle}>
                <Text style={DevDetails.main}>{dev.name}</Text>
                <Text style={DevDetails.bio}>{dev.bio}</Text>
                <Text style={DevDetails.techs}>{dev.techs.join(", ")}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={SearchForm}>
        <TextInput
          style={SearchInput}
          placeholder="Buscar devs por Techs"
          placeholderTextColor="#999"
          autoCorrect={false}
          autoCapitalize="words"
          value={techs}
          onChangeText={setTechs}
        />
        <TouchableOpacity style={LoadButton} onPress={loadDevs}>
          <MaterialIcons name="my-location" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}
