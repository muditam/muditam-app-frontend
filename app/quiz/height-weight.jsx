import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


const ITEM_WIDTH = 12;
const screenWidth = Dimensions.get("window").width;


const generateInchLabels = () => {
  const list = [];
  for (let feet = 4; feet <= 6; feet++) {
    for (let inch = 0; inch <= 11; inch++) {
      const totalInches = feet * 12 + inch;
      if (totalInches >= 48 && totalInches <= 77) {
        list.push({ label: `${feet}'${inch}"`, value: totalInches });
      }
    }
  }
  return list;
};


const generateNumericRange = (min, max, step = 2) => {
  const range = [];
  for (let i = min; i <= max; i += step) {
    range.push(Math.round(i * 10) / 10); // Keep one decimal if needed
  }
  return range;
};


const generateLbsRange = () => {
  const range = [];
  for (let i = 20; i <= 200; i++) {
    range.push(Math.round(i * 2.20462));
  }
  return Array.from(new Set(range));
};




const Ruler = ({ data, selectedValue, setSelectedValue, isInchFormat }) => {
  const flatListRef = useRef();


  useEffect(() => {
    const index = data.findIndex((item) =>
      typeof item === "object"
        ? item.value === selectedValue
        : item === selectedValue
    );
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }
  }, [data, selectedValue]);


  return (
    <View style={{ position: "relative", height: 70 }}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2 - ITEM_WIDTH / 2,
          alignItems: "flex-end",
        }}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        keyExtractor={(item) =>
          (typeof item === "object" ? item.value : item).toString()
        }
        onMomentumScrollEnd={(event) => {
          let index = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH
          );


          // Clamp index to stay within data bounds
          if (index < 0) index = 0;
          if (index >= data.length) index = data.length - 1;


          const val = data[index];
          setSelectedValue(typeof val === "object" ? val.value : val);
        }}
        renderItem={({ item }) => {
          const value = typeof item === "object" ? item.value : item;
          const label = typeof item === "object" ? item.label : item;


          const isSelected = value === selectedValue;
          const isMajor = value % 10 === 0;


          const tickColor = isSelected ? "#000" : isMajor ? "#000" : "#999";


          const tickHeight = isSelected ? 45 : isMajor ? 30 : 15;
          const tickWidth = isSelected ? 2 : 1;
          const labelColor = isSelected ? "#000" : "#999";
          const tickPadding =isSelected?4: isMajor? 4 :8;


          return (
            <View
              style={{
                width: ITEM_WIDTH,
                alignItems: "center",
                justifyContent: "flex-end",
                height: 50,
              }}
            >
              {isMajor && (
                <Text
                  style={{
                    fontSize: 18,
                    color: labelColor,
                    fontWeight: isSelected ? "bold" : "400",
                    width: 45,
                    textAlign: "center",
                    display:isSelected?"none":"true"
                  }}
                >
                  {label}
                </Text>
              )}
              <View
                style={{
                  width: tickWidth,
                  height: tickHeight,
                  backgroundColor: tickColor,
                  marginBottom:tickPadding,
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
};


export default function HeightWeightScreen() {
  const router = useRouter();
  const [heightUnit, setHeightUnit] = useState("inches");
  const [weightUnit, setWeightUnit] = useState("kg");


  const [height, setHeight] = useState(60); // cm or inchValue
  const [weight, setWeight] = useState(70); // kg or lbs


  const inchLabels = generateInchLabels();
  const cmRange = generateNumericRange(122, 196);
  const kgRange = generateNumericRange(20, 200);
  const lbsRange = generateLbsRange();


  // Height Toggle
  const toggleHeightUnit = (unit) => {
    if (unit === heightUnit) return;


    if (unit === "inches") {
      const inches = Math.round(height / 2.54);
      setHeight(inches);
    } else {
      const cm = Math.round(height * 2.54);
      setHeight(cm);
    }


    setHeightUnit(unit);
  };


  // Weight Toggle
  const toggleWeightUnit = (unit) => {
    if (unit === weightUnit) return;


    if (unit === "lbs") {
      const lbs = Math.round(weight * 2.20462);
      setWeight(lbs);
    } else {
      const kg = Math.round(weight / 2.20462);
      setWeight(kg);
    }


    setWeightUnit(unit);
  };


  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={{
          uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2_3f1a9fbb-3859-430c-96e3-1f78f9efc641.png?v=1747201712",
        }}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingTop: 40,
          height: 100,
        }}
        resizeMode="cover"
      >
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </Pressable>


        <Text
          style={{
            fontSize: 30,
            color: "white",
            letterSpacing: 3,
            fontWeight: "500",
          }}
        >
          MEASURE
        </Text>


        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 10 }}
        >
          <Feather name="x" size={24} color="white" />
        </Pressable>
      </ImageBackground>


      <View style={{ marginHorizontal: 18 }}>
        <Text
          style={{
            fontSize: 18,
            color: "#2E2E2E",
            marginTop: 30,
            marginBottom: 10,
          }}
        >
          Select your height and weight
        </Text>


        <View
          style={{
            height: 3,
            backgroundColor: "#EEEEEE",
            width: "17%",
            marginBottom: 20,
          }}
        />


        {/* HEIGHT */}
        <View style={[styles.rulerBox, { backgroundColor: "#D6EBEB" }]}>
          <Text style={styles.selectedValue}>
            {heightUnit === "cm"
              ? height
              : inchLabels.find((i) => i.value === height)?.label}
            <Text style={styles.unit}> {heightUnit}</Text>
          </Text>
          <Ruler
            data={heightUnit === "cm" ? cmRange : inchLabels}
            selectedValue={height}
            setSelectedValue={setHeight}
          />
        </View>
        <View style={styles.toggleRow}>
          <UnitToggle
            options={["inches", "cm"]}
            value={heightUnit}
            onChange={(unit) => toggleHeightUnit(unit)}
          />
        </View>


        {/* WEIGHT */}
        <View style={[styles.rulerBox, { backgroundColor: "#F6F3BA" }]}>
          <Text style={styles.selectedValue}>
            {weight}
            <Text style={styles.unit}> {weightUnit}</Text>
          </Text>
          <Ruler
            data={weightUnit === "kg" ? kgRange : lbsRange}
            selectedValue={weight}
            setSelectedValue={setWeight}
          />
        </View>
        <View style={styles.toggleRow}>
          <UnitToggle
            options={["lbs", "kg"]}
            value={weightUnit}
            onChange={(unit) => toggleWeightUnit(unit)}
          />
        </View>
      </View>


      <TouchableOpacity
      style={styles.nextButton}
      onPress={async () => {
        try {
          await AsyncStorage.setItem(
            "userVitals",
            JSON.stringify({ height, weight })
          );

          const progress = await AsyncStorage.getItem("quizProgress");
          const resumeIndex = progress ? JSON.parse(progress).answers?.length || 0 : 0;

          router.push('/quiz/HbA1cScreen');
        } catch (e) {
          console.error("Failed to save height/weight", e);
          router.push("/quiz/0");
        }
      }}
    >
      <Text style={styles.nextButtonText}>Next</Text>
    </TouchableOpacity>
    </View>
  );
}


const UnitToggle = ({ options, value, onChange }) => {
  return (
    <View style={styles.toggleContainer}>
      {options.map((option) => {
        const isActive = option === value;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.toggleOption,
              isActive ? styles.toggleActive : styles.toggleInactive,
            ]}
          >
            <Text
              style={
                isActive ? styles.toggleTextActive : styles.toggleTextInactive
              }
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};


const styles = StyleSheet.create({
  rulerBox: {
    borderRadius: 8,
    paddingTop:0,
    paddingBottom:8,
    marginBottom: 10,
  },
  selectedValue: {
    fontSize: 50,
    fontWeight: "500",
    textAlign: "center",
  },
  unit: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#543087",
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
    elevation: 5,
    paddingHorizontal: 50,
    alignSelf: "center",
    marginBottom: 40,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
  },


  //   new style


  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 999,
    padding: 1,
    marginBottom: 20,
    alignSelf: "center",
    width: 200,
  },


  toggleOption: {
    flex: 1,
    paddingVertical:5,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },


  toggleActive: {
    backgroundColor: "#231b36", // dark fill
  },


  toggleInactive: {
    backgroundColor: "transparent",
  },


  toggleTextActive: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },


  toggleTextInactive: {
    color: "#bbb",
    fontWeight: "500",
    fontSize: 14,
  },
});
