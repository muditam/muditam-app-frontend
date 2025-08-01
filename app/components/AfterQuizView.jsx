import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HbA1cProgressView from './AfterView/HbA1cProgressView';
import AfterProductList from './AfterView/AfterProductList';
import Result from './AfterView/Result';
import FeaturesComparison from './AfterView/FeaturesComparison';
import ReviewsRatings from './AfterView/ReviewsRatings';
import ReviewsSection from './AfterView/ReviewsSection';
import RetakeQuizBox from './AfterView/RetakeQuizBox';
import PlansInclude from './AfterView/PlansInclude';
import HeroVideoList from '../components/HeroVideoList';
import ChatWithUsSection from '../components/ChatWithUsSection';
import StepsSection from '../components/StepsSection';
import ExpertsPanelCard from '../components/ExpertsPanelCard';
import RealJourneysSlider from '../components/RealJourneysSlider';
import NeedHelpSection from '../components/NeedHelpSection';

const ROOT_CAUSES_CONFIG = [ 
    {
        key: 'body_weight',
        label: 'Body Weight',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Body_Weight_dae952f9-e7ce-4eb9-b175-1b25c2d5f267.png?v=1751959866',
    },
    {
        key: 'genetics',
        label: 'Genetic',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Genetic.png?v=1751959866',
    },
    {
        key: 'thyroid',
        label: 'Thyroid',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Thyroid_e2655085-0b32-4c78-8b4d-96af43c51bbf.png?v=1751959866',
    },
    {
        key: 'fatty_liver',
        label: 'Fatty Liver',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Fatty_Liver_ef8cba82-6329-4876-af75-b2e30964b17d.png?v=1751959867',
    },
    {
        key: 'cholesterol',
        label: 'Cholesterol',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Cholesterol_e4a50abc-215c-4f1a-88ea-beed7df2238b.png?v=1751959866',
    },
    {
        key: 'hypertension',
        label: 'Hypertension',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Hypertension_ae4a1c22-6800-4647-882d-f596081cbe2d.png?v=1751959866',
    },
    {
        key: 'stress',
        label: 'Stress',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Stress_74f7c035-9061-4e2b-906d-8d3de769a350.png?v=1751959866',
    },
    {
        key: 'lifestyle',
        label: 'Lifestyle',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/LifeStyle_198ffd9c-fa70-4869-829c-9ecd65d31345.png?v=1751959866',
    },
    {
        key: 'insulin',
        label: 'Insulin Resistance',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/insulin.png?v=1751960630',
    },
];

function calculateBMI(heightCm, weightKg) {
    if (!heightCm || !weightKg) return 0;
    const hM = Number(heightCm) / 100;
    return Number(weightKg) / (hM * hM);
}

function getRootCausesFromQuiz(answers, userVitals) {
    const causes = [];

    // 1. BMI
    if (userVitals && userVitals.height && userVitals.weight) {
        const bmi = calculateBMI(userVitals.height, userVitals.weight);
        if (bmi > 23) causes.push('body_weight');
    }

    // 2. Genetics: Q1 (index 0)
    const q1 = answers[0];
    if (q1 && Array.isArray(q1) ? q1.some(ans => ans !== 'None') : q1 !== 'None') {
        causes.push('genetics');
    }

    // 3. Comorbidities: Q6 (index 5)
    const q6 = answers[5];
    if (q6) {
        if (Array.isArray(q6)) {
            if (q6.includes('Thyroid')) causes.push('thyroid');
            if (q6.includes('Fatty Liver')) causes.push('fatty_liver');
            if (q6.includes('High Cholesterol')) causes.push('cholesterol');
            if (q6.includes('Hypertension')) causes.push('hypertension');
        }
    }

    // 4. Stress: Q10 (index 9)
    const q10 = answers[9];
    if (q10 && q10 === 'Yes') causes.push('stress');

    // 5. Lifestyle: Q12 (index 11) - "How frequently do you engage in physical activity?"
    const q12 = answers[11];
    if (
        q12 &&
        q12 !== "I exercise or walk atleast 30 mins daily"
    ) {
        causes.push('lifestyle');
    }

    // 6. Lifestyle: Q11 (index 10) - "How often do you eat or drink sugary foods?"
    const q11 = answers[10];
    if (
        q11 &&
        (q11 === "Regularly - I can't resist sweet desserts or snacks" ||
            q11.startsWith("Frequently") ||
            q11.startsWith("Rarely"))
    ) {
        if (!causes.includes('lifestyle')) causes.push('lifestyle');
    }

    return causes;
}

export default function AfterQuizView() {
    const [name, setName] = useState('User');
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedCause, setSelectedCause] = useState('Heart');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [gender, setGender] = useState('');
    const [quizCauses, setQuizCauses] = useState([]);
    const [sliderIndex, setSliderIndex] = useState(0);
    const [customerCount, setCustomerCount] = useState('23,235');

    const causeDescriptions = {
        Heart: 'If you’ve left something or want to update a response on the diabetes test, simply re-take it.',
        Kidney: 'Kidney issues are common with high sugar. You can re-take the test to update your inputs.',
        Nerve: 'Nerve damage due to sugar is serious. Re-take the quiz to adjust your answers anytime.',
        Foot: 'Foot complications may arise from diabetes. Update your test if something was missed.',
    };

    
    useEffect(() => {
        const loadAll = async () => {
            const userData = await AsyncStorage.getItem('userDetails');
            const parsed = JSON.parse(userData || '{}');
            if (parsed?.name) setName(parsed.name);
            if (parsed?.gender) setGender(parsed.gender);

            const userVitalsRaw = await AsyncStorage.getItem('userVitals');
            const userVitals = userVitalsRaw ? JSON.parse(userVitalsRaw) : {};
            const quizRaw = await AsyncStorage.getItem('quizProgress');
            const quiz = quizRaw ? JSON.parse(quizRaw) : {};
            const quizAnswers = quiz.answers || [];
            let causes = getRootCausesFromQuiz(quizAnswers, userVitals);

            // If less than 3, add lifestyle if not already
            if (causes.length < 3 && !causes.includes('lifestyle')) causes.push('lifestyle');
            // If less than 2, also add insulin resistance
            if (causes.length < 2 && !causes.includes('insulin')) causes.push('insulin');

            setQuizCauses(causes);

            const randomCustomers = Math.floor(Math.random() * (50000 - 30000 + 1)) + 30000;
            setCustomerCount(randomCustomers.toLocaleString('en-IN'));
        };
        loadAll();
    }, []);

    const getCauseData = (key) => ROOT_CAUSES_CONFIG.find(x => x.key === key);

    // For slider if >4, else show all
    const showSlider = quizCauses.length > 4;
    const sliderWindow = 4; // show 4 at a time

    let displayedCauses = quizCauses;
    if (showSlider) {
        displayedCauses = quizCauses.slice(sliderIndex, sliderIndex + sliderWindow);
        // Loop if at end
        if (displayedCauses.length < sliderWindow && quizCauses.length >= sliderWindow) {
            displayedCauses = displayedCauses.concat(
                quizCauses.slice(0, sliderWindow - displayedCauses.length)
            );
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Report Card */}
                <View style={styles.reportCard}>
                    <View style={styles.profileRow}>
                        <Image
                            source={{
                                uri:
                                    gender === 'Male'
                                        ? 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Male.png?v=1750153759'
                                        : 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Female_8b0512eb-3582-4d53-9609-4924bd169c3a.png?v=1750153759',
                            }}
                            style={styles.profileImage}
                        />
                        <View>
                            <Text style={styles.nameText}>Hi {name}</Text>
                            <Text style={styles.reportIntro}>Here’s what your diabetes analysis{'\n'}report says:</Text>
                        </View>
                    </View>

                    {/* Root Cause Card */}
                    <View style={styles.rootCard}>
                        <Text style={styles.reportHeading}>Your Diabetes Root Causes</Text>
                        <View style={[styles.rootCauses, showSlider && { justifyContent: 'flex-start' }]}>
                            {displayedCauses.map((key, index) => {
                                const cause = getCauseData(key);
                                return (
                                    <View key={key} style={styles.causeItem}>
                                        <Image source={{ uri: cause.image }} style={styles.causeIcon} />
                                        <Text style={styles.causeLabel}>{cause.label}</Text>
                                    </View> 
                                );
                            })}
                        </View>
                        {showSlider && (
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => setSliderIndex((prev) => (prev - 1 + quizCauses.length) % quizCauses.length)}
                                    style={{ marginHorizontal: 10 }}
                                >
                                    <Text style={{ fontSize: 28, color: '#543287' }}>{'‹'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSliderIndex((prev) => (prev + 1) % quizCauses.length)}
                                    style={{ marginHorizontal: 10 }}
                                >
                                    <Text style={{ fontSize: 28, color: '#543287' }}>{'›'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>



                {/* HbA1c Drop Bar */}
                <View style={styles.hba1cContainer}>
                    <Text style={styles.hba1cText}>HbA1c Drop Possibility 93%</Text>

                    <View style={styles.hba1cBarBg}>
                        <View style={styles.hba1cBarFill}>

                        </View>
                    </View>
                </View>

                {/* Note */}
                <Text style={styles.noteText}>
                    *Based on {customerCount} customers of Muditam Ayurveda that match this profile.
                </Text>

                <View style={styles.impactSection}>
                    <Text style={styles.impactTitle}>Impact of High Sugar</Text>
                    <View style={styles.impactIcons}>
                        {[
                            {
                                label: 'Heart',
                                icon: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Heart_411a6ee7-8dc7-47a7-b1f3-f7d12f5ca883.png?v=1747394357',
                            },
                            {
                                label: 'Kidney',
                                icon: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Kidneys_cbeb8c7a-6d2c-46db-bb0c-2f6a8ad9d419.png?v=1747394357',
                            },
                            {
                                label: 'Nerve',
                                icon: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Nerve_d10bc9ad-9857-4fea-b984-8192738ce6fc.png?v=1747394357',
                            },
                            {
                                label: 'Foot',
                                icon: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Foot_41be811d-646b-4908-a3e5-8a756ef8d134.png?v=1747394357',
                            },
                        ].map((item, index) => {
                            const isSelected = selectedCause === item.label; 

                            return (
                                <Pressable
                                    key={index}
                                    style={styles.circleBoxWrapper}
                                    onPress={() => setSelectedCause(item.label)}
                                >
                                    <View style={[styles.circle, isSelected && styles.circleActive]}>
                                        <Image source={{ uri: item.icon }} style={styles.iconInsideCircle} />
                                    </View>
                                    <Text
                                        style={[
                                            styles.causeLabel,
                                            isSelected && styles.causeLabelActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>



                    <View style={styles.dynamicBox}>
                        <Text style={styles.dynamicText}>
                            {causeDescriptions[selectedCause]}
                        </Text>
                    </View>
                </View>

                <HbA1cProgressView />
                <AfterProductList setTotalPrice={setTotalPrice} totalPrice={totalPrice} setSelectedProducts={setSelectedProducts} />
                <Result />
                <ChatWithUsSection />
                <PlansInclude />
                <StepsSection />
                <RetakeQuizBox />
                <HeroVideoList />
                <RealJourneysSlider />
                <FeaturesComparison />
                <ExpertsPanelCard />
                <NeedHelpSection />
                <ReviewsRatings />
                <ReviewsSection />

                {(() => {
                    const [imageHeight, setImageHeight] = useState(0);
                    const imageUrl = 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/footer.png?v=1750146666';
                    const sideMargin = 20; // 20px left + right

                    useEffect(() => {
                        Image.getSize(
                            imageUrl,
                            (width, height) => {
                                const calculatedWidth = Dimensions.get('window').width - sideMargin * 2;
                                const calculatedHeight = (height / width) * calculatedWidth;
                                setImageHeight(calculatedHeight);
                            },
                            (error) => {
                                console.error('Failed to get image size:', error);
                            }
                        );
                    }, []);

                    if (!imageHeight) {
                        return (
                            <View style={{ height: 200, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 40, marginHorizontal: sideMargin }}>
                                <ActivityIndicator size="large" color="#543287" />
                            </View>
                        );
                    }

                    return (
                        <View style={{ marginTop: -50, marginBottom: 80, marginHorizontal: sideMargin }}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={{ width: Dimensions.get('window').width - sideMargin * 2, height: imageHeight }}
                                resizeMode="contain"
                            />
                        </View>
                    );
                })()}
            </ScrollView>


            {/* Price & CTA floating at bottom */}
            <View style={styles.priceContainer}>
                <View>
                    <Text style={styles.price}>₹{totalPrice.toFixed(0)}</Text>
                    <Text style={styles.tax}>Inclusive of all taxes</Text>
                </View>
                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={async () => {
                        try {
                            const validItems = selectedProducts.filter(
                                (item) => item.first_variant_id && item.quantity > 0
                            );

                            if (validItems.length === 0) {
                                Alert.alert("No products selected", "Please add products to continue.");
                                return;
                            }

                            const response = await fetch('https://muditam-app-backend.onrender.com/api/shopify/create-cart', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ items: validItems }),
                            });

                            const data = await response.json();

                            if (!response.ok || !data.cartId) {
                                Alert.alert("Checkout Failed", "Unable to create cart. Try again.");
                                return;
                            }

                            const cartToken = data.cartId.split('/').pop();

                            // Navigate to GoKwikCheckout
                            const { router } = require("expo-router");
                            router.push({
                                pathname: '/GoKwikCheckout',
                                params: { cartId: cartToken, total: totalPrice },
                            });
                        } catch (err) {
                            console.error("Error launching checkout:", err);
                            Alert.alert("Error", "Something went wrong. Please try again.");
                        }
                    }}
                >
                    <Text style={styles.buyText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    reportCard: {
        backgroundColor: '#9D57FF', 
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        padding: 15,
        paddingBottom: 80,
    },
    nameText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'Poppins',
        color: 'white',
    },
    reportIntro: {
        fontSize: 14,
        color: 'white',
        marginBottom: 10,
        fontFamily: 'Poppins',
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reportHeading: {
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Poppins',
        marginBottom: 10,
    },
    rootCauses: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        backgroundColor: '#fff',
    },
    rootCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    rootCausess: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    causeItem: {
        alignItems: 'center',
        width: '25%',
    },
    causeIcon: {
        width: 36,
        height: 36,
        marginBottom: 6,
    },
    causeLabel: {
        fontSize: 12,
        color: '#404040',
        textAlign: 'center',
        fontFamily: 'Poppins',
    },
    hba1cContainer: {
        padding: 20,
        marginTop: -35,
        borderRadius: 30,
        backgroundColor: 'white',
        alignItems: 'flex-start',
    },
    hba1cBarBg: {
        width: '100%',
        height: 30,
        backgroundColor: '#F3E9FF',
        borderRadius: 999,
        overflow: 'hidden',
        justifyContent: 'flex-start',
    },
    hba1cBarFill: {
        width: '93%',
        height: '100%',
        backgroundColor: '#A05CFF',
        justifyContent: 'center',
        paddingLeft: 16,
        padding: 5,
        borderTopLeftRadius: 999,
        borderBottomLeftRadius: 999,
        borderTopRightRadius: 999,
        borderBottomRightRadius: 999,
    },
    hba1cText: {
        fontWeight: '700',
        fontSize: 20,
        fontFamily: 'Poppins',
        marginBottom: 14,
    },
    noteText: {
        fontSize: 11,
        color: '#404040',
        textAlign: 'center',
        marginTop: 12,
        marginHorizontal: 16,
        fontFamily: 'Poppins',
    },
    noteTexted: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 12,
        marginHorizontal: 16,
        fontFamily: 'Poppins',
    },
    priceContainer: {
        position: 'absolute',
        bottom: '0%',
        left: 0,
        right: 0,
        backgroundColor: '#F3E9FF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingRight: 16,
        paddingLeft: 34,
        borderRadius: 0,
        elevation: 5,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Poppins',
        color: '#000',
    },
    tax: {
        fontSize: 14,
        fontFamily: 'Poppins',
    },
    buyButton: {
        backgroundColor: '#9D57FF',
        paddingVertical: 6,
        paddingHorizontal: 40,
        borderRadius: 4,
    },
    buyText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    impactSection: {
        marginTop: 20,
        marginHorizontal: 16,
    },
    impactTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins',
        marginBottom: 12,
        color: '#000',
    },
    impactIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    causeBox: {
        alignItems: 'center',
        width: '23%',
        paddingVertical: 10,
        borderRadius: 4,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#8F8F8F',
    },
    causeBoxActive: {
        backgroundColor: '#EBDBFF',
    },
    causeLabel: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontFamily: 'Poppins',
    },
    circleBoxWrapper: {
        alignItems: 'center',
        width: '23%',
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#A3A3A3',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    circleActive: {
        backgroundColor: '#EBDDFF',
        borderColor: '#EBDDFF',
    },
    iconInsideCircle: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },

    dynamicBox: {
        backgroundColor: '#EBDBFF',
        padding: 14,
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    dynamicText: {
        fontSize: 12,
        fontFamily: 'Poppins',
        lineHeight: 20,
        textAlign: 'center',
        fontWeight: '500',
    },
});

 