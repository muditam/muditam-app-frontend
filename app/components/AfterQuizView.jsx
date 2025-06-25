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


export default function AfterQuizView() {
    const [name, setName] = useState('User');
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedCause, setSelectedCause] = useState('Heart');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [gender, setGender] = useState('');

    const causeDescriptions = {
        Heart: 'If you’ve left something or want to update a response on the diabetes test, simply re-take it.',
        Kidney: 'Kidney issues are common with high sugar. You can re-take the test to update your inputs.',
        Nerve: 'Nerve damage due to sugar is serious. Re-take the quiz to adjust your answers anytime.',
        Foot: 'Foot complications may arise from diabetes. Update your test if something was missed.',
    };

    useEffect(() => {
        const loadName = async () => {
            const userData = await AsyncStorage.getItem('userDetails');
            const parsed = JSON.parse(userData || '{}');
            if (parsed?.name) setName(parsed.name);
            if (parsed?.gender) setGender(parsed.gender);
        };
        loadName();
    }, []);

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
                        <View style={styles.rootCauses}>
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
                            ].map((item, index) => (
                                <View key={index} style={styles.causeItem}>
                                    <Image source={{ uri: item.icon }} style={styles.causeIcon} />
                                    <Text style={styles.causeLabel}>{item.label}</Text>
                                </View>
                            ))}
                        </View>
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
                    *Based on 23,235 customers of Muditam Ayurveda that match this profile.
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
        width: '23%',
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

 