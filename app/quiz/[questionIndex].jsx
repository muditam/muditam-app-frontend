import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { RadioButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const questions = [
  {
    id: 1,
    question: "Does anyone in your family have a history of diabetes?",
    type: "choice",
    title: "Family History",
    options: [
      "Mother or anyone from mother's side of family",
      "Father or anyone from father's side of family",
      "Both",
      "None",
    ],
    tips: "Having blood relatives with diabetes, triples the chances of developing the condition.",
  },
  {
    id: 2,
    question: "What is your current diabetes status?",
    type: "choice",
    title: "Your Current Condition",
    options: [
      "Yes, I am Type-2 Diabetic",
      "Yes, I am Pre-Diabetic",
      "Yes, I am Type 2 Diabetic & also on Insulin",
      "No, I am not Diabetic",
      "I am not aware",
    ],
    tips: "Diabetes Reversal is Possible with small changes in Lifestyle, Diet and Ayurveda.",
  },
  {
    id: 3,
    question: "From how many years do you have diabetes?",
    type: "choice",
    title: "Duration",
    options: ["<1 Year", "1-6 Years", "6-15 Years", "15+ Years"],
    tips: "The longer you have diabetes, the more likely you are to have complications. That's why it's important to reverse it as soon as you can.",
  },
  {
    id: 4,
    question: "What is your recent fasting blood sugar(FBS) level?",
    type: "choice",
    title: "FBS Level",
    options: [
      "70-99 mg/dL",
      "100-125 mg/dL",
      "126- 200 mg/dL",
      "201-300 mg/dL",
      "301-400 mg/dL",
      "More than 400 mg/dL",
      "I am not aware",
    ],
    tips: `Some people have increased fasting blood sugar levels dueto high cortisol (stress hormone) levels, a phenomenon known as "Dawn phenomenon". And for a fasting blood sugar test, you need at least 8 hours without food.`,
  },
  {
    id: 5,
    question:
      "What is your recent post-prandial blood sugar (PPBS) level (2-hrs after food)?",
    type: "choice",
    title: "PPBS Level",
    options: [
      "Less than 140 mg/dL",
      "141-180 mg/dL",
      "181-250 mg/dL",
      "251-300 mg/dL",
      "301-400 mg/dL",
      "More than 400 mg/dL",
      "I am not aware",
    ], 
  },
  {
    id: 6,
    question: "Do you have any other conditions other than diabetes?",
    type: "multi",
    title: "Other Conditions",
    options: [
      "Hypertension",
      "High Cholesterol",
      "Thyroid",
      "Fatty Liver",
      "High Uric Acid",
      "None",
    ],
    tips: "32.2% of Diabetic people suffer from heart related diseases.",
  },
  {
    id: 7,
    question:
      "Do you experience any of the following symptoms related to diabetes?",
    type: "multi",
    title: "Symptoms",
    options: [
      "Nerve Pain",
      "Tiredness",
      "Sexual Weakness",
      "Frequent Urination",
      "Sugar Cravings",
      "Tingling sensation",
      " Weak Eye Sight",
      "Acidity",
      "Gas",
      "Constipation",
      "None",
    ],
  },
  {
    id: 8,
    question: "How are your energy levels throughout the day?",
    type: "choice",
    title: "Energy Level",
    options: ["Good", "Moderate", "Low", "Always Tired"],
    tips: "High blood sugar can cause low energy levels by disturbing the body's ability to use sugar for energy.",
  },
  {
    id: 9,
    question: "How is your sleep cycle?",
    type: "choice",
    title: "Sleep Cycle",
    options: [
      "Good (7+ hrs. of sleep)",
      "Improper Sleep (Less than 6 hrs.)",
      "Disturbed",
      "Difficulty Falling Asleep",
      "Have to Consume Sleeping Pills",
    ],
    tips: "Not getting enough sleep or interrupted sleep can raise HbA1c levels because it messes with our hormones.",
  },
  {
    id: 10,
    question: "Do you have any stress?",
    type: "choice",
    title: "Stress",
    options: ["Yes", "No"],
    tips: "Hormones from stress increase your blood pressure, raise your heart rate and can cause blood sugar to rise.",
  },
  {
    id: 11,
    question: "How often do you eat or drink sugary foods?",
    type: "choice",
    title: "Sugar Consumption",
    options: [
      "Regularly - I can't resist sweet desserts or snacks",
      "Frequently - I consume sugar in tea or coffee (2 or more teaspoons of sugar daily)",
      "Rarely - I have sweet foods occasionally (once a week or less)",
      "Never - I don't eat or drink sweet foods at all",
    ],
    tips: "Surprisingly, just twor rusks can hide a teaspoon of sugar within them!",
  },
  {
    id: 12,
    question: "How frequently do you engage in physical activity?",
    type: "choice",
    title: "Physical Activity",
    options: [
      "I exercise or walk atleast 30 mins daily",
      "I exercise or walk for less than 30 mins daily",
      "I exercise or walk occasionally",
      "I don't get time to exercise or walk",
    ],
    tips: "Regular exercise or even just a daily walk can significantly improve your blood sugar control and reduce chances of complications by 40%.",
  },
  {
    id: 13,
    question: "What kind of treatment you are currently taking for diabetes?",
    type: "choice",
    title: "Medication",
    options: [
      "Allopathic medicine(tablets)",
      "Insulin",
      "Ayurveda",
      "Homeopathy",
      "Home Remedies",
      "No, I am currently not taking any kind of Treatment",
    ],
    tips: "While allopathic medicine is usually required for life long use, alternative therapies like Ayurveda can help you to reduce dependency on medicine.",
  },
  {
    id: 14,
    question: "Do you feel any change in your weight in last 6 months?",
    type: "choice",
    title: "Weight Fluctuation",
    options: ["Recently Gained Weight", "Recently Lost Weight", "No Change"],
    tips: "85% of people with Diabetes are overweight and weight gain worsen the diabetes.",
  },
];


export default function QuestionScreen() {
  const { questionIndex } = useLocalSearchParams();
  const index = parseInt(questionIndex || 0);
  const router = useRouter();

  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]); 
  const [inputValue, setInputValue] = useState("");

  const currentQuestion = questions[index];

  useEffect(() => {
    const loadPreviousAnswers = async () => {
      try {
        const stored = await AsyncStorage.getItem("quizProgress");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAnswers(parsed.answers || []);
          const prevAnswer = parsed.answers?.[index];
          if (Array.isArray(prevAnswer)) {
            setSelectedOption(prevAnswer);
          } else {
            setSelectedOption(prevAnswer || []);
          }
        }
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    };
    loadPreviousAnswers();
  }, [index]);

  const saveProgress = async (updatedAnswers) => {
    try {
      await AsyncStorage.setItem("quizProgress", JSON.stringify({
        answers: updatedAnswers,
      }));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    try {
      const userData = await AsyncStorage.getItem("userVitals");
      const { height, weight } = JSON.parse(userData || "{}");

      const userDetails = await AsyncStorage.getItem("userDetails");
      const phone = JSON.parse(userDetails || "{}")?.phone;

      const hba1cValue = await AsyncStorage.getItem("hba1c");
      const hba1c = hba1cValue ? JSON.parse(hba1cValue) : null;

      const response = await fetch("https://muditam-app-backend.onrender.com/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, height, weight, hba1c, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.removeItem("quizProgress");

        // ✅ Save quiz completion per user
        if (phone) {
          await AsyncStorage.setItem(`quizCompleted_${phone}`, 'true');
        }

        router.replace('/home');
      } else {
        Alert.alert("Error", data.error || "Failed to submit quiz.");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Alert.alert("Error", "Something went wrong while submitting your answers.");
    }
  };

  const handleNext = (value = inputValue || selectedOption) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    saveProgress(updatedAnswers);

    if (index + 1 < questions.length) {
      router.push({ pathname: `/quiz/${index + 1}` });
    } else {
      submitAnswers(updatedAnswers);
    }
  };

  const toggleSelection = (option) => {
    if (selectedOption.includes(option)) {
      setSelectedOption(selectedOption.filter((o) => o !== option));
    } else {
      setSelectedOption([...selectedOption, option]);
    }
  };

  // PROGRESS BAR
  const total = questions.length;
  const progress = ((index + 1) / total) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
            style={{
              paddingHorizontal: 10,
              bottom:20,
            }}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>

          <Text
            style={{
              fontSize: 23,
              fontWeight: "600",
              color: "white", 
              bottom:20,
            }}
          >
            {currentQuestion.title}
          </Text>


          <Pressable
            onPress={() => router.replace("/home")}
            style={{
              paddingHorizontal: 10,
              bottom:20,
            }}
          >
            <Feather name="x" size={24} color="white" />
          </Pressable>
        </ImageBackground>



        <View style={styles.progressBarWrapper}>
          <Text style={styles.progressPercent}>0%</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{`${Math.round(progress)}%`}</Text>
        </View>

        <View style={{ display: "flex", marginHorizontal: 18 }}>
          <Text
            style={{
              fontSize: 18,
              color: "#2E2E2E",
              marginTop: 30,
              marginBottom: 10,
            }}
          >
            {currentQuestion.question}
            {currentQuestion.type === "multi" && (
              <Text style={{ fontSize: 14, color: "gray" }}>
                {" "}
                (Select as many as you have)
              </Text>
            )}
          </Text>

          <View
            style={{
              height: 3,
              backgroundColor: "#EEEEEE",
              width: "17%",
              marginBottom: 20,
            }}
          />

          {currentQuestion.type === "select" && (
            <View style={{ borderWidth: 1, borderRadius: 1 }}>
              <Picker
                selectedValue={selectedOption}
                onValueChange={(itemValue) => setSelectedOption(itemValue)}
              >
                <Picker.Item label="Select" value="" style={{ fontSize: 16 }} />
                {currentQuestion.options.map((opt, i) => (
                  <Picker.Item key={i} label={`${opt} inches`} value={opt} />
                ))}
              </Picker>
            </View>
          )}

          {currentQuestion.type === "choice" && (
            <View style={{ marginBottom: 30 }}>
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedOption === option;
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      setSelectedOption(option);
                      setTimeout(() => handleNext(option), 200);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 6,
                      marginBottom: 18,
                      paddingHorizontal: 10,
                      paddingVertical: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? "#BFA3F6" : "#ccc",
                      backgroundColor: isSelected ? "#F3EDFF" : "white",
                    }}
                  >
                    <Feather
                      name={isSelected ? "check-circle" : "circle"}
                      size={22}
                      color={isSelected ? "#543287" : "#aaa"}
                      style={{ marginRight: 14 }}
                    />
                    <Text style={{ flex: 1, fontSize: 14 }}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {currentQuestion.type === "multi" && (
            <View
              style={{
                paddingVertical: 10,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {currentQuestion.options.map((opt, i) => {
                const isChecked = selectedOption.includes(opt);
                return (
                  <Pressable
                    key={i}
                    onPress={() => toggleSelection(opt)}
                    style={{
                      width: "48%",
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      marginBottom: 18,
                      borderWidth: 1,
                      borderColor: isChecked ? "#BFA3F6" : "#ccc",
                      backgroundColor: isChecked ? "#F3EDFF" : "#fff",
                      borderRadius: 6,
                    }}
                  >
                    <View
                      style={{
                        height: 16,
                        width: 16,
                        borderRadius: 2,
                        borderWidth: 2,
                        borderColor: "#ccc",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                      }}
                    >
                      {isChecked && (
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            backgroundColor: "#543087",
                            height: 16,
                            width: 16,
                            textAlign: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name="check" size={14} color="white" />
                        </Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 14 }}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {currentQuestion.type === "multi" && (
            <View
              style={{
                marginTop: 5,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity style={styles.nextButton} onPress={() => handleNext([...selectedOption])}>
                <Text style={styles.nextButtonText}>
                  {index === questions.length - 1 ? "Finish" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentQuestion.tips && (
            <View
              style={{
                backgroundColor: "#FAFAFA",
                borderRadius: 8,
                borderTopWidth: 3,
                borderTopColor: "#543087",
                padding: 12,
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 13,
                  color: "gray",
                  marginBottom: 5,
                  marginTop: 5,
                }}
              >
                Did you know?
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#333",
                  lineHeight: 18, 
                  marginBottom: 5,
                }}
              > 
                {currentQuestion.tips}
              </Text>
            </View>
          )}
        </View> 
      </View> 
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  progressBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
    marginBottom: -2,
  },
  progressPercent: {
    fontSize: 12,
    color: "#888",
    width: 34,
    textAlign: "center",
  },
  progressBar: {
    flex: 1,
    height: 9,
    borderRadius: 8,
    backgroundColor: "#F2F1F8",
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9D57FF",
    borderRadius: 8,
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
});

