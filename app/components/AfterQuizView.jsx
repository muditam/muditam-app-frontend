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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HbA1cProgressView from './AfterView/HbA1cProgressView';  
import AfterProductList from './AfterView/AfterProductList';  
import Result from './AfterView/Result'; 
import FeaturesComparison from './AfterView/FeaturesComparison'; 
import ReviewsRatings from './AfterView/ReviewsRatings'; 
import ReviewsSection from './AfterView/ReviewsSection'; 

export default function AfterQuizView() {
    const [name, setName] = useState('User');

    const [selectedCause, setSelectedCause] = useState('Heart');

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
        };
        loadName();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Banner Image */}
                <Image
                    source={{
                        uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Artboard_1_f2f232d4-6b66-4a29-812f-9e13bdab2724.png?v=1747311860',
                    }}
                    style={styles.banner}
                    resizeMode="contain"
                />

                {/* Report Card */}
                <View style={styles.reportCard}>
                    <Text style={styles.nameText}>Hi {name}</Text>
                    <Text style={styles.reportIntro}>
                        Here’s what your diabetes analysis report says:
                    </Text>

                    <View style={styles.rowHeader}>
                        <Text style={styles.reportHeading}>Your Diabetes Root Causes</Text>
                        <View style={styles.line} />
                    </View>

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

                {/* HbA1c Drop Bar */}
                <View style={styles.hba1cContainer}>
                    <View style={styles.hba1cBarBg}>
                        <View style={styles.hba1cBarFill}>
                            <Text style={styles.hba1cText}>HbA1c Drop Possibility 93%</Text>
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
                        ].map((item, index) => (
                            <Pressable
                                key={index}
                                style={[
                                    styles.causeBox,
                                    selectedCause === item.label && styles.causeBoxActive,
                                ]}
                                onPress={() => setSelectedCause(item.label)}
                            >
                                <Image source={{ uri: item.icon }} style={styles.causeIcon} />
                                <Text
                                    style={[
                                        styles.causeLabel,
                                        selectedCause === item.label && styles.causeLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.dynamicBox}>
                        <Text style={styles.dynamicText}>
                            {causeDescriptions[selectedCause]}
                        </Text>
                    </View>
                </View>

                <HbA1cProgressView />

                <AfterProductList />

                <Result />

                <FeaturesComparison />

                <ReviewsRatings />

                <ReviewsSection />

            </ScrollView>

            {/* Price & CTA floating at bottom */}
            <View style={styles.priceContainer}>
                <View>
                    <Text style={styles.price}>₹2514</Text>
                    <Text style={styles.tax}>Inclusive of all taxes</Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                    <Text style={styles.buyText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 120,
        backgroundColor: '#fff',
    },
    banner: {
        width: '100%',
        height: 440,
    },
    reportCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: -100,
        padding: 16,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'Poppins',
    },
    reportIntro: {
        fontSize: 13,
        color: '#444',
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
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
    line: {
        flex: 1,
        height: 1.5,
        backgroundColor: '#E0E0E0',
        marginLeft: 10,
        marginTop: 5,
    },
    rootCauses: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        color: '#333',
        textAlign: 'center',
        fontFamily: 'Poppins',
    },
    hba1cContainer: {
        marginHorizontal: 16,
        marginTop: 20,
        alignItems: 'flex-start',
    },
    hba1cBarBg: {
        width: '100%',
        height: 34,
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
        borderTopLeftRadius: 999,
        borderBottomLeftRadius: 999,
        borderTopRightRadius: 999,
        borderBottomRightRadius: 999,
    },
    hba1cText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
        fontFamily: 'Poppins',
    },
    noteText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginTop: 12,
        marginHorizontal: 16,
        fontFamily: 'Poppins',
    },
    noteTexted: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 12,
        marginHorizontal: 16,
        fontFamily: 'Poppins',
    },
    priceContainer: {
        position: 'absolute',
        bottom: '0%',
        left: 0,
        right: 0,
        backgroundColor: '#f3e7ff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
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
        fontSize: 12,
        color: '#666',
        fontFamily: 'Poppins',
    },
    buyButton: {
        backgroundColor: '#B264F7',
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 5,
    },
    buyText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
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
  borderRadius: 8,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#eee',
},
causeBoxActive: {
  backgroundColor: '#e8d9fb',
},
causeLabel: {
  fontSize: 12,
  color: '#333',
  textAlign: 'center',
  fontFamily: 'Poppins',
},
causeLabelActive: {
  color: '#9D57FF',
  fontWeight: '600',
},
dynamicBox: {
  backgroundColor: '#f3e9ff',
  padding: 12,
  borderRadius: 8,
},
dynamicText: {
  fontSize: 13,
  color: '#333',
  fontFamily: 'Poppins',
  lineHeight: 18,
},

});
