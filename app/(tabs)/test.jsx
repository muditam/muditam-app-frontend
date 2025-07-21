import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; 
import { Feather } from '@expo/vector-icons';

export default function TestTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={['top', 'bottom', 'left', 'right']}>
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
            height: 100,
          }}
          resizeMode="cover"
        >
          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 10 }}>
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable> 

          <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>DIABETES QUIZ</Text>

          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 10 }}>
            <Feather name="x" size={24} color="white" />
          </Pressable>
        </ImageBackground>

        <View style={{ marginHorizontal: 16 }}>
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 20 }}>
              Here's to your first step towards a life liberated from diabetes!
              Let's start strong together!
            </Text>
          </View>

          <View
            style={{
              borderWidth: 0.25,
              borderColor: "black",
              borderRadius: 8,
              marginTop: 30,
            }}
          >
            {/* First image and text */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 30,
                marginHorizontal: 16,
              }}
            >
              <Image
                source={{
                  uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Clock_157306d1-ddf0-4b02-af15-2de92f80da7b.png?v=1747201662",
                }}
                style={{ height: 40, width: 40, marginRight: 10 }}
                resizeMode="cover"
              />
              <Text style={{ flex: 1, fontSize: 15 }}>
                Answer few questions in 2 minutes
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                borderBottomColor: "black",
                borderBottomWidth: 0.5,
                marginVertical: 30,
                marginHorizontal: 20,
              }}
            />

            {/* Second image and text */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                marginHorizontal: 20,
              }}
            >
              <Image
                source={{
                  uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sugar_blood_level.png?v=1747201662",
                }}
                style={{ height: 40, width: 40, marginRight: 10 }}
                resizeMode="cover"
              />
              <Text style={{ flex: 1, fontSize: 15 }}>
                Understand your diabetes stage and potential for reversal
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                borderBottomColor: "black",
                borderBottomWidth: 0.5,
                marginVertical: 30,
                marginHorizontal: 20,
              }}
            />

            {/* Third image and text */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 30,
                marginHorizontal: 20,
              }}
            >
              <Image
                source={{
                  uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Support.png?v=1747201662",
                }}
                style={{ height: 40, width: 40, marginRight: 10 }}
                resizeMode="cover"
              />
              <Text style={{ flex: 1, fontSize: 15 }}>
                Get our expert's advice and personalised solution within 24 hrs
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push("/quiz/height-weight")}
          >
            <Text style={styles.nextButtonText}>START NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nextButton: {
    backgroundColor: "#543087",
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
    elevation: 5,
    paddingHorizontal: 50,
    alignSelf: "center",
    marginBottom: 40,
    marginTop: 40,
    fontWeight: "900",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
  },
});
