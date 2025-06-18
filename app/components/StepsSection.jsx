import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";


const { width } = Dimensions.get("window");
const STEP_WIDTH = 379 + 16;


const stepData = [
  {
    title: "Connect with a diabetes coach",
    subtitle:
      "Get instant access to a free diabetes coach who will guide you on how to start the treatment",
  },
  {
    title: "Get a personalized treatment plan",
    subtitle:
      "Our expert will create a treatment plan tailored to your health goals and current condition",
  },
  {
    title: "Start your journey towards better health",
    subtitle:
      "Follow your coach’s guidance, track your progress, and achieve sustainable results",
  },
];


const Steps = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);


  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / STEP_WIDTH);
    setActiveIndex(index);
  };


  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: index * STEP_WIDTH, animated: true });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        What Happens After You Place An Order?
      </Text>
      <View style={{ marginRight: 16 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
        >
          {stepData.map((step, index) => (
            <View key={index} style={styles.box}>
              <View style={styles.rowOne}>
                <Text style={styles.number}>{index + 1}</Text>
                <Text style={styles.title}>{step.title}</Text>
              </View>
              <Text style={styles.subtitle}>{step.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
      </View>


      <View style={styles.dotsContainer}>
        {stepData.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => scrollToIndex(index)}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: activeIndex === index ? "#000" : "#D9D9D9",
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


export default Steps;


const styles = StyleSheet.create({
  container: {
    paddingVertical:16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "500",
    marginLeft: 16,
  },
  box: {
    width: 379,
    height: 165,
    borderRadius: 8,
    borderWidth: 0.5,
    paddingHorizontal: 20,
    marginLeft: 16,
    backgroundColor: "#fff",
    marginBottom: 35,
    top: 30,
  },
  rowOne: {
    flexDirection: "row",
  },


  number: {
  position: "absolute",
  top: -30,
  left: "40%",
  width: 70,
  height: 70,
  borderRadius: 35,
  borderWidth: 1,
  borderColor: "gray",
  backgroundColor: "#fff",
  textAlign: "center",
  lineHeight: 70,
  fontSize: 50,
  fontWeight: "500",
  color: "#03AD31",
  zIndex: 10,
},




  title: {
    fontSize: 22,
    marginTop: 50,
    fontWeight: "500",
    color: "#000000",
    marginLeft: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#000000",
    textAlign: "center",
    paddingTop: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});



