import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LegalModal from "../../components/LegalModal";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const router = useRouter();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetOtp = async () => {
  if (phoneNumber.length !== 10) {
    return Alert.alert("Invalid Number", "Please enter a 10-digit mobile number.");
  }

  if (phoneNumber === "1234567890") {
    await AsyncStorage.setItem("userPhone", phoneNumber);
    router.push({ pathname: "/otp", params: { phone: phoneNumber } });
    return;
  }

  setLoading(true);
  try {
    const response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: "451604A8TTLksfVyk06825bdc5P1",
      },
      body: JSON.stringify({
        mobile: `91${phoneNumber}`,
        sender: "MUDITM",
        template_id: "6883510ad6fc0533183824b2",
        otp_length: "6",
        otp_expiry: "10"
      }),
    });

    const data = await response.json();
    console.log("OTP send response:", data);

    if (data.type === "success") {
      await AsyncStorage.setItem("userPhone", phoneNumber);
      router.push({ pathname: "/otp", params: { phone: phoneNumber } });
    } else {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    Alert.alert("Error", "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const privacyContent = `Welcome to Muditam Ayurveda Private Limited (“we”, “our”, or “us”). This privacy policy (“Privacy Policy”) describes in detail how we collect, use, store, disclose, and protect your personal and sensitive personal data when you access or use our website www.muditam.com, mobile applications, or any other services, content, or products provided via our platform (“Platform”).
By accessing our Platform or using any of our services, you confirm that you have read, understood, and consented to the collection, processing, storage, and transfer of your information as described herein. If you do not agree with the terms of this Privacy Policy, please do not use the Platform or avail of any Services.

1. LEGAL BASIS
This Privacy Policy is published in compliance with:
Section 43A of the Information Technology Act, 2000 

Rule 4 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules, 2011

Rule 3(1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021

2. SCOPE AND APPLICABILITY
This Privacy Policy applies to all individuals who access our Platform or use our services, including teleconsultations, expert advice, lifestyle modifications, and supplement purchase and tracking. It also applies to any information collected from you via forms, surveys, chatbots, telephonic interactions, or any other means of communication used in the course of providing our services.
This policy does not cover third-party websites or platforms linked through our Platform. We encourage you to read their privacy policies before interacting with them.

3. COLLECTION OF INFORMATION
3.1 Information You Provide
We may collect personal and sensitive personal data (collectively, “Information”) including but not limited to:
Name, contact number, email address, postal address

Date of birth, gender, marital status

Health-related data: symptoms, conditions, lab results, diagnostic history

Details of consultations, prescriptions, and medical advice

Payment details: card number, UPI, billing address (processed via secure third-party gateways)

Lifestyle details: diet, activity, habits, medication adherence

We may collect Information when you:
Register or create an account on the Platform

Book a consultation or health call

Purchase any product or subscription

Interact with our support or service teams

Participate in quizzes, assessments, or surveys

Access educational or health resources through the Platform

3.2 Information Collected Automatically
When you access or use the Platform, we may automatically collect:
Device data: IP address, OS, browser, device ID

App usage: page views, features used, time spent

Cookies and similar technologies to remember your preferences and analyze behavior

Log files, crash reports, and diagnostic data

3.3 App Permissions
We may request permissions to access:
Camera (for health progress uploads)

Location (for service personalization)

Storage (for caching reports and files)

Notifications (for alerts and reminders)

You may manage or revoke such permissions at any time from your device settings.

4. USE OF INFORMATION
We use your Information to:
Provide and manage your wellness program and consultation experience

Connect you with health coaches, Ayurvedic practitioners, and diagnostic labs

Customize lifestyle, diet, and supplement plans

Facilitate appointment bookings, follow-ups, and delivery of services

Fulfill product orders and manage payments

Notify you of order updates, offers, and health alerts

Improve Platform functionality, monitor usage, and conduct analytics

Carry out research, analysis, and data-driven improvements

Ensure regulatory compliance and resolve disputes

We may use anonymized or aggregated data for statistical, analytical, or commercial purposes.

5. DISCLOSURE OF INFORMATION
Your Information may be disclosed to:
Internal employees, consultants, or support teams

Medical practitioners, health experts, or wellness coaches

Diagnostic labs, logistics providers, payment processors

IT partners (e.g., Firebase, Razorpay, Clevertap) for infrastructure, communication, and analytics

Legal, regulatory, or law enforcement agencies as mandated

Buyers or successors in case of corporate restructuring

All third parties are contractually bound to maintain confidentiality and use Information solely for the purpose disclosed.

6. INTERNATIONAL DATA TRANSFER
Your data may be transferred and stored on servers outside India where the data protection laws may differ. We ensure that such transfers comply with Indian regulations and maintain equivalent protection standards.

7. SECURITY PRACTICES
We adopt reasonable security practices including:
SSL encryption and secure socket layers

Role-based access control

Password protection and two-factor authentication

Data anonymization where feasible

Regular audits, monitoring, and employee training

Despite best efforts, no system is immune to risk. You are responsible for keeping your login credentials confidential.

8. DATA RETENTION
We retain your Information as long as:
Your account is active

Required for delivering services or resolving queries

Required for regulatory or legal obligations

Upon request or termination, data may be deleted or anonymized unless legally required otherwise.

9. USER RIGHTS
You have the right to:
Access your Information held by us

Request correction of inaccurate or outdated data

Withdraw consent or delete your account

Opt-out of marketing communications

For exercising any rights, please email hello@muditam.com. We may need to verify your identity before processing.

10. CHILDREN’S PRIVACY
Use of the Platform is restricted to individuals aged 18 and above. We do not knowingly collect Information from children. If you are a parent/guardian and believe we have collected data from a child, please contact us to remove it.

11. THIRD-PARTY LINKS
Our Platform may contain links to third-party websites and tools. We are not responsible for their privacy practices. Please review the third-party privacy policies before use.

12. CHANGES TO THIS PRIVACY POLICY
We may revise this Privacy Policy periodically. Material changes will be notified via the Platform or email. Continued use of the Platform constitutes acceptance of the revised terms.

13. GRIEVANCE OFFICER
In accordance with applicable law:
Grievance Officer
 Muditam Ayurveda Private Limited
 252/9, Kumar Gali, Near Ranital Mohalla
 Nahan, District Sirmaur, Himachal Pradesh – 173001
 CIN: U51909HP2022PTC009277
 Email: hello@muditam.com
 Toll-Free: +91-8989174741
We aim to resolve all complaints within one month from the date of receipt.

14. MISCELLANEOUS
14.1 Indemnity
You agree to indemnify and hold harmless Muditam Ayurveda Private Limited, its directors, officers, agents, and employees from any losses, liabilities, claims, or demands due to your use of the Platform or violation of this Privacy Policy.
14.2 Severability
If any clause of this Privacy Policy is found invalid or unenforceable, the remainder shall remain in full force and effect.
14.3 Governing Law and Jurisdiction
This Privacy Policy shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts at Himachal Pradesh.

For any queries, clarifications, or concerns, please write to hello@muditam.com.
`;
  const termsContent = `This document is an electronic record in accordance with the Information Technology Act, 2000 and rules thereunder, and is published in accordance with Rule 3(1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021. This electronic record is generated by a computer system and does not require any physical or digital signatures.

1. INTRODUCTION
These terms and conditions ("Terms") govern your access to and use of the website www.muditam.com, the Muditam mobile application (together, the "Platform"), and any services or products made available through the Platform by Muditam Ayurveda Private Limited ("Muditam", "we", "us", or "our").
These Terms, along with our Privacy Policy, Returns & Refunds Policy, and any other policies or disclaimers available on the Platform, constitute a legally binding agreement between you and Muditam.
By accessing the Platform, creating an account, availing any service or purchasing any product, you agree to these Terms.

2. ELIGIBILITY OF USE
Use of the Platform is permitted only to individuals who are capable of entering into legally binding contracts under Indian Contract Act, 1872. Persons who are “incompetent to contract” (e.g., minors, un-discharged insolvents, etc.) are not eligible to use the Platform.
If you are under 18 years of age, your use of the Platform must be through a parent or legal guardian.
Muditam reserves the right to deny access or usage to anyone found ineligible or in violation of these Terms.

3. SERVICES AND PRODUCTS
Muditam provides holistic wellness services to help users manage diabetes and related health complications. These include:
Expert-led consultations (via phone or digital mode)

Customized wellness plans based on user assessments

Lifestyle and dietary recommendations

Ayurvedic and nutritional supplements

Progress tracking and app-based guidance

Muditam does not provide emergency medical services or replace your physician’s clinical judgment. Our services are not intended to diagnose, treat, cure, or prevent any disease(s).

4. NO DOCTOR-PATIENT RELATIONSHIP
You understand that:
The consultations are delivered by certified health coaches, nutritionists, Ayurvedic experts, and wellness professionals.

The engagement with Muditam does not create a doctor-patient relationship.

All content, communication, and recommendations are for general wellness and informational purposes.

Muditam disclaims all responsibility for any adverse health outcomes that may result from ignoring primary medical advice.

5. ONLINE & TELE-CONSULTATION
You may be required to:
Complete assessments regarding your symptoms, history, lifestyle, and lab reports.

Engage with wellness experts via call, video, or chat, all of which are recorded for quality and compliance purposes.

You acknowledge:
That Muditam may rely on your submitted data for generating recommendations.

That you are responsible for ensuring accuracy and completeness of shared information.

That Muditam is not liable for miscommunication, misinformation, or outcomes due to incorrect or withheld data.

6. CUSTOMIZED WELLNESS PLANS
Customized plans may be offered based on:
Input from assessments

Expert review

Feedback from external consultants

Plans may include dietary changes, supplement schedules, lifestyle advice, and regular follow-ups. Muditam reserves the right to modify or reject plan enrollment based on internal guidelines.

7. ACCOUNT CREATION
To use key features, you must register for an account. You agree to:
Provide accurate and current information

Secure your account credentials

Notify us immediately of any unauthorized access

Multiple accounts, account transfers, impersonation, or fraudulent creation are strictly prohibited.

8. PAYMENT TERMS
Product and service prices are shown inclusive or exclusive of taxes as applicable.

Prices may change without notice.

Placing a product in the cart does not guarantee price or availability.

We reserve the right to cancel orders if pricing or stock issues arise.

Payments are processed through third-party gateways. Muditam is not responsible for failures or errors in the transaction process caused by such processors.

9. RETURNS, CANCELLATION & REFUND
Returns, cancellations, and refunds will be governed by our Returns & Refunds Policy. Refunds, where applicable, will be processed back to the original payment method within prescribed timelines.

10. SHIPPING & DELIVERY
Products will be shipped to the address provided by you.

Third-party couriers are considered your agents for delivery.

Delivery timelines are indicative and not binding.

Delays caused by events outside Muditam’s control will not be the basis for liability.

11. USER RESPONSIBILITIES
By using the Platform, you agree to:
Share truthful, complete, and up-to-date information

Not use the Platform for unlawful, fraudulent, or abusive purposes

Not upload harmful or offensive content

Comply with all applicable laws and these Terms

12. INTELLECTUAL PROPERTY
All content, software, logos, branding, graphics, and materials available on the Platform are the intellectual property of Muditam or its licensors.
You may not copy, distribute, modify, or create derivative works from the Platform content without explicit written permission.

13. TERM & TERMINATION
These Terms are effective unless terminated. We may suspend or terminate your account:
For breach of Terms

On receiving a legal request

For inactivity or misuse

Your obligations (including indemnity, disclaimers, etc.) survive termination.

14. DISCLAIMERS
Muditam services are provided "as is" without warranties of any kind.

We do not warrant uninterrupted access, completeness, accuracy, or reliability of services.

We do not recommend or endorse any specific medical treatments or prescription drugs.

The Platform is not a substitute for real-time or emergency healthcare services.

15. LIMITATION OF LIABILITY
To the fullest extent permitted by law, Muditam is not liable for:
Any indirect, incidental, special, or consequential damages

Errors or omissions in the service

User actions or misuse

Technical issues or service delays

Our total liability under any claim shall not exceed the amount paid by you under the relevant order.

16. NOTICE & TAKEDOWN
If you believe content on the Platform violates the law or your rights, contact our Grievance Officer. We will take reasonable steps to investigate and take action within a reasonable time.

17. INDEMNITY
You agree to indemnify and hold harmless Muditam, its officers, employees, and partners from any claims, liabilities, damages, or expenses arising from:
Your use of the Platform

Violation of the Terms

Your conduct or content

18. DATA USE AND PRIVACY
Muditam collects and processes your data in accordance with its Privacy Policy available at www.muditam.com/privacy-policy.
By using our Platform, you consent to our collection and use of your personal data.

19. MODIFICATION OF TERMS
Muditam may modify these Terms at any time. Updated versions will be posted on the Platform. Continued use after changes constitutes your acceptance.

20. GOVERNING LAW AND JURISDICTION
These Terms shall be governed by and construed in accordance with Indian law. All disputes shall be subject to the exclusive jurisdiction of the courts in Himachal Pradesh.
Any disputes not resolved through mutual discussions shall be settled by arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall take place in Himachal Pradesh in English by a sole arbitrator appointed by Muditam.

21. MISCELLANEOUS
Severability: If any provision is found unenforceable, the remaining provisions shall remain valid.

Assignment: You may not assign your rights or obligations under these Terms without written consent.

Waiver: Our failure to enforce any right or provision will not constitute a waiver of that right.

Force Majeure: We are not liable for failure to perform obligations due to events beyond our control.

22. GRIEVANCE OFFICER
Grievance Officer
Muditam Ayurveda Private Limited
252/9, Kumar Gali, Near Ranital Mohalla,
Nahan, District Sirmaur, Himachal Pradesh – 173001
CIN: U51909HP2022PTC009277
Email: hello@muditam.com
Phone: +91-8989174741
For any complaints or grievances, please contact our Grievance Officer using the above details.
`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header Image */}
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_5b6c94fe-8228-4d5c-934d-62dde3ab6f26.png?v=1751977906",
            }}
            style={{ width: "100%", height: 430 }}
            resizeMode="cover"
          />

          {/* Content Card */}
          <View
            style={{
              marginTop: -180,
              marginHorizontal: 16,
              backgroundColor: "white",
              paddingTop: 40,
              paddingHorizontal: 16,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 1.3,
              paddingBottom: 90,
            }}
          >
            {/* Heading */}
            <Text
              style={{
                fontFamily: "Poppins",
                fontWeight: "bold",
                fontSize: 26,
                textAlign: "left",
                marginBottom: 30,
              }}
            >
              Kindly fill in the details:
            </Text>

            {/* Phone Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "black",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 53,
                marginBottom: 20,
              }}
            >
              <Text style={{ marginRight: 10, fontSize: 17 }}>+91</Text>
              <TextInput
                style={{ flex: 1, fontSize: 17, color: "#000" }}
                keyboardType="number-pad"
                placeholder="Enter your number"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#666" // iOS-specific dull text fix
              />
            </View>
 
            {/* Get OTP Button */}
            <TouchableOpacity
              style={{
                backgroundColor:
                  phoneNumber.length === 10 ? "#9D57FF" : "#D1D5DB",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={handleGetOtp}
              disabled={loading}
            >
              <Text
                style={{ color: "white", fontWeight: "600", fontSize: 18 }}
              >
                {loading ? "Please wait..." : "Get OTP"}
              </Text>
            </TouchableOpacity>

            {/* Gradient Line */}
            <View
              style={{
                flexDirection: "row",
                height: 1,
                marginTop: 60,
                marginBottom: 50,
                borderRadius: 1,
              }}
            >
              <LinearGradient
                colors={["transparent", "#666666", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  width: "95%",
                  height: 0.5,
                }}
              />
            </View>

            {/* Legal Text */}
            <View
              style={{
                borderTopColor: "#eee",
                marginBottom: 10,
                paddingTop: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 16, color: "#B5B5B5", textAlign: "center" }}
              >
                By Signing in, I accept the
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: "center",
                  color: "#B5B5B5",
                  marginTop: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    textDecorationLine: "underline",
                    textDecorationColor: "#000000",
                    color: "#000000",
                  }}
                  onPress={() => setShowTerms(true)}
                >
                  Terms & Conditions
                </Text>{" "}
                and{" "}
                <Text
                  style={{
                    fontSize: 17,
                    color: "#000000",
                    textDecorationLine: "underline",
                    textDecorationColor: "#000000",
                  }}
                  onPress={() => setShowPrivacy(true)}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        <LegalModal
          visible={showPrivacy}
          onClose={() => setShowPrivacy(false)}
          title="Privacy Policy"
          lastUpdated="09 July 2025"
          content={privacyContent}
          animationType="slide"
          transparent={true}
        />
        <LegalModal
          visible={showTerms}
          onClose={() => setShowTerms(false)}
          title="Terms of Service"
          lastUpdated="09 July 2025"
          content={termsContent}
          animationType="slide"
          transparent={true}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
