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
    title: "Connect with a \ndiabetes coach",
    subtitle: "Get instant access to a free diabetes coach who will guide you on how to start the treatment",
  },
  {
    title: "Get a personalized \ntreatment plan",
    subtitle: "Our expert will create a treatment plan tailored to your health goals and current condition",
  },
  {
    title: "Start your journey \ntowards better health",
    subtitle: "Follow your coach’s guidance, track your progress, and achieve sustainable results",
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
    paddingVertical: 20,
    marginTop: -50, 
  },
  headerText: {
    fontSize: 22,
    fontWeight: "500",
    marginLeft: 16,
    paddingVertical: 20,
  },
  box: {
    width: 379,
    height: 175,
    borderRadius: 8,
    borderWidth: 0.5,
    paddingHorizontal: 20,
    marginLeft: 16,
    backgroundColor: "#fff",
  },
  rowOne: {
    flexDirection: "row",
  },
  number: {
    fontSize: 100,
    lineHeight: 100,
    fontWeight: "600",
    color: "#03AD31",
    textAlign: "right",
    paddingTop: 5,
  },
  title: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: "400",
    color: "#000000",
    paddingVertical: 16,
    marginLeft: 5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#000000",
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
