import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Pressable,
    Alert,
    Platform,
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
import FooterImageSection from '../components/FooterImageSection';

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

function normalizeAnswerList(answer) {
    if (Array.isArray(answer)) return answer.filter(Boolean);
    return answer ? [answer] : [];
}

function incrementScore(scoreMap, key, amount) {
    scoreMap[key] = (scoreMap[key] || 0) + amount;
}

function getRootCausesFromQuiz(answers, userVitals) {
    const scores = {};
    const bmi = calculateBMI(userVitals?.height, userVitals?.weight);
    const familyHistory = answers[0];
    const diabetesStatus = answers[1];
    const fastingSugar = answers[3];
    const postMealSugar = answers[4];
    const conditions = normalizeAnswerList(answers[5]);
    const symptoms = normalizeAnswerList(answers[6]);
    const sleepCycle = answers[8];
    const hasStress = answers[9];
    const sugarIntake = answers[10];
    const activityLevel = answers[11];
    const treatment = answers[12];
    const weightChange = answers[13];

    if (bmi >= 27) {
        incrementScore(scores, 'body_weight', 4);
        incrementScore(scores, 'insulin', 2);
    } else if (bmi >= 23) {
        incrementScore(scores, 'body_weight', 3);
        incrementScore(scores, 'insulin', 1);
    }

    if (weightChange === 'Recently Gained Weight') {
        incrementScore(scores, 'body_weight', 2);
        incrementScore(scores, 'insulin', 1);
    } else if (weightChange === 'Recently Lost Weight') {
        incrementScore(scores, 'insulin', 1);
    }

    if (familyHistory && familyHistory !== 'None') {
        incrementScore(scores, 'genetics', familyHistory === 'Both' ? 4 : 3);
    }

    if (diabetesStatus === 'Yes, I am Type 2 Diabetic & also on Insulin') {
        incrementScore(scores, 'insulin', 5);
    } else if (
        diabetesStatus === 'Yes, I am Type-2 Diabetic' ||
        diabetesStatus === 'Yes, I am Pre-Diabetic'
    ) {
        incrementScore(scores, 'insulin', 3);
    }

    if (
        fastingSugar === '201-300 mg/dL' ||
        fastingSugar === '301-400 mg/dL' ||
        fastingSugar === 'More than 400 mg/dL'
    ) {
        incrementScore(scores, 'insulin', 3);
    } else if (fastingSugar === '126- 200 mg/dL') {
        incrementScore(scores, 'insulin', 2);
    } else if (fastingSugar === '100-125 mg/dL') {
        incrementScore(scores, 'insulin', 1);
    }

    if (
        postMealSugar === '251-300 mg/dL' ||
        postMealSugar === '301-400 mg/dL' ||
        postMealSugar === 'More than 400 mg/dL'
    ) {
        incrementScore(scores, 'insulin', 3);
    } else if (postMealSugar === '181-250 mg/dL') {
        incrementScore(scores, 'insulin', 2);
    } else if (postMealSugar === '141-180 mg/dL') {
        incrementScore(scores, 'insulin', 1);
    }

    if (conditions.includes('Thyroid')) incrementScore(scores, 'thyroid', 4);
    if (conditions.includes('Fatty Liver')) {
        incrementScore(scores, 'fatty_liver', 4);
        incrementScore(scores, 'insulin', 1);
    }
    if (conditions.includes('High Cholesterol')) incrementScore(scores, 'cholesterol', 4);
    if (conditions.includes('Hypertension')) incrementScore(scores, 'hypertension', 4);

    if (hasStress === 'Yes') incrementScore(scores, 'stress', 3);
    if (
        sleepCycle === 'Improper Sleep (Less than 6 hrs.)' ||
        sleepCycle === 'Disturbed' ||
        sleepCycle === 'Difficulty Falling Asleep' ||
        sleepCycle === 'Have to Consume Sleeping Pills'
    ) {
        incrementScore(scores, 'stress', 2);
    }

    if (activityLevel === 'I exercise or walk for less than 30 mins daily') {
        incrementScore(scores, 'lifestyle', 1);
        incrementScore(scores, 'insulin', 1);
    } else if (
        activityLevel === 'I exercise or walk occasionally' ||
        activityLevel === "I don't get time to exercise or walk"
    ) {
        incrementScore(scores, 'lifestyle', 3);
        incrementScore(scores, 'insulin', 1);
    }

    if (sugarIntake === "Regularly - I can't resist sweet desserts or snacks") {
        incrementScore(scores, 'lifestyle', 3);
        incrementScore(scores, 'insulin', 1);
    } else if (sugarIntake?.startsWith('Frequently')) {
        incrementScore(scores, 'lifestyle', 2);
    } else if (sugarIntake?.startsWith('Rarely')) {
        incrementScore(scores, 'lifestyle', 1);
    }

    if (
        symptoms.includes('Sugar Cravings') ||
        symptoms.includes('Acidity') ||
        symptoms.includes('Gas') ||
        symptoms.includes('Constipation')
    ) {
        incrementScore(scores, 'lifestyle', 1);
    }
    if (symptoms.includes('Tiredness') || symptoms.includes('Frequent Urination')) {
        incrementScore(scores, 'insulin', 1);
    }

    if (treatment === 'Insulin') {
        incrementScore(scores, 'insulin', 3);
    } else if (
        treatment === 'Allopathic medicine(tablets)' ||
        treatment === 'No, I am currently not taking any kind of Treatment'
    ) {
        incrementScore(scores, 'insulin', 1);
    }

    const rankedCauses = Object.entries(scores)
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key);

    return rankedCauses.slice(0, 4);
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
    const sections = useMemo(
        () => [
            'impact',
            'progress',
            'products',
            'result',
            'chat',
            'plans',
            'steps',
            'retake',
            'hero',
            'journeys',
            'features',
            'experts',
            'help',
            'ratings',
            'reviews',
            'footer',
        ],
        []
    );

    const causeDescriptions = useMemo(() => ({
        Heart: 'If you’ve left something or want to update a response on the diabetes test, simply re-take it.',
        Kidney: 'Kidney issues are common with high sugar. You can re-take the test to update your inputs.',
        Nerve: 'Nerve damage due to sugar is serious. Re-take the quiz to adjust your answers anytime.',
        Foot: 'Foot complications may arise from diabetes. Update your test if something was missed.',
    }), []);

    
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
            if (!causes.length) {
                causes = ['insulin', 'lifestyle', 'stress'];
            } else if (causes.length === 1 && !causes.includes('lifestyle')) {
                causes = [...causes, 'lifestyle'];
            } else if (causes.length === 2 && !causes.includes('stress')) {
                causes = [...causes, 'stress'];
            }

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

    const renderHeader = useCallback(
        () => (
            <>
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

                    <View style={styles.rootCard}>
                        <Text style={styles.reportHeading}>Your Diabetes Root Causes</Text>
                        <View style={[styles.rootCauses, showSlider && { justifyContent: 'flex-start' }]}>
                            {displayedCauses.map((key) => {
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

                <View style={styles.hba1cContainer}>
                    <Text style={styles.hba1cText}>93% Noticed Progress</Text>

                    <View style={styles.hba1cBarBg}>
                        <View style={styles.hba1cBarFill} />
                    </View>
                </View>

                <Text style={styles.noteText}>
                    *Based on {customerCount} customers of Muditam Ayurveda that match this profile.
                </Text>
            </>
        ),
        [customerCount, displayedCauses, gender, name, quizCauses.length, showSlider]
    );

    const renderSection = useCallback(({ item }) => {
        switch (item) {
            case 'impact':
                return (
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
                            ].map((impactItem, index) => {
                                const isSelected = selectedCause === impactItem.label;

                                return (
                                    <Pressable
                                        key={index}
                                        style={styles.circleBoxWrapper}
                                        onPress={() => setSelectedCause(impactItem.label)}
                                    >
                                        <View style={[styles.circle, isSelected && styles.circleActive]}>
                                            <Image source={{ uri: impactItem.icon }} style={styles.iconInsideCircle} />
                                        </View>
                                        <Text
                                            style={[
                                                styles.causeLabel,
                                                isSelected && styles.causeLabelActive,
                                            ]}
                                        >
                                            {impactItem.label}
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
                );
            case 'progress':
                return <HbA1cProgressView />;
            case 'products':
                return <AfterProductList setTotalPrice={setTotalPrice} totalPrice={totalPrice} setSelectedProducts={setSelectedProducts} />;
            case 'result':
                return <Result />;
            case 'chat':
                return <ChatWithUsSection />;
            case 'plans':
                return <PlansInclude />;
            case 'steps':
                return <StepsSection />;
            case 'retake':
                return <RetakeQuizBox />;
            case 'hero':
                return <HeroVideoList />;
            case 'journeys':
                return <RealJourneysSlider />;
            case 'features':
                return <FeaturesComparison />;
            case 'experts':
                return <ExpertsPanelCard />;
            case 'help':
                return <NeedHelpSection />;
            case 'ratings':
                return <ReviewsRatings />;
            case 'reviews':
                return <ReviewsSection />;
            case 'footer':
                return <FooterImageSection />;
            default:
                return null;
        }
    }, [causeDescriptions, selectedCause, totalPrice]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <FlatList
                data={sections}
                keyExtractor={(item) => item}
                renderItem={renderSection}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.container}
                removeClippedSubviews={Platform.OS === 'android'}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={6}
            />


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

                            const response = await fetch('https://muditam-app-backend-ca1c8b03db09.herokuapp.com/api/shopify/create-cart', {
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
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 20,
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
        justifyContent: 'space-evenly',
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

 
