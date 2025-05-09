import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    Dimensions,
    ScrollView,
} from 'react-native';

const doctors = [
    {
        id: '1',
        name: 'Dr. Puja Suri',
        role: 'Ayurvedic Practitioner',
        experience: '12 Years',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Dr._Puja_Suri_1.png?v=1727694738',
        bio: 'Dr. Puja Suri is a seasoned Ayurvedic Practitioner with over 12 years of experience. She specializes in holistic approaches to hair and skin issues, combining traditional wisdom with modern care.',
    },
    {
        id: '2',
        name: 'Dr. Anil Vishnoi',
        role: 'Dermatologist',
        experience: '18 Years',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Dr._Anil_Vishnoi_3d793707-9aa8-4f40-9666-180655f56738.jpg?v=1703760253',
        bio: 'Dr. Anil Vishnoi is a dermatologist with 18 years of clinical experience. He’s known for his expertise in diagnosing scalp and hair issues and creating custom regimens for patients.',
    },
    {
        id: '3',
        name: 'Dr. Dinesh Pareek',
        role: 'Trichologist',
        experience: '15 Years',
        image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Dr._Dinesh_Pareek_b9c00cbd-1bae-49fe-8dd6-197deb12520c.jpg?v=1703760108',
        bio: 'Dr. Dinesh Pareek is a certified trichologist with 15 years of experience treating hair fall, baldness, and dandruff. His methods are rooted in Ayurvedic science and natural therapy.',
    },
];

const { width } = Dimensions.get('window');

export default function DoctorsSection() {
    const [isModalVisible, setModalVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef();

    const openModal = (index) => {
        setActiveIndex(index);
        setModalVisible(true);
    };

    return (
        <View className="mt-4 mb-4">
            <Text className="text-xl font-semibold px-4 mb-4">Meet Our Team Of Doctors</Text>

            <FlatList
                data={doctors}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => openModal(index)}
                        className="bg-white border border-gray-300 rounded-xl mr-4 p-4 w-64"
                    >
                        <View className="flex-row items-center mb-3">
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text className="font-semibold text-base">{item.name}</Text>
                                <Text className="text-sm text-gray-500">{item.role}</Text>
                            </View>
                        </View>
                        <View className="border-t border-[#b3d589] mt-2 pt-2">
                            <Text className="text-sm font-medium">Experience: {item.experience}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-2xl p-6 max-h-[90%]">
                        <TouchableOpacity
                            className="absolute top-4 right-4"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-xl">✕</Text>
                        </TouchableOpacity>

                        <Text className="text-lg font-semibold mb-3">Meet Our Team Of Doctors</Text>

                        <FlatList
                            ref={flatListRef}
                            horizontal
                            pagingEnabled
                            snapToInterval={width}
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            data={doctors}
                            keyExtractor={(item) => item.id}
                            initialScrollIndex={activeIndex}
                            getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        width: width * 0.80,
                                        alignSelf: 'center',
                                        borderWidth: 1,
                                        borderColor: '#e0e0e0',
                                        borderRadius: 12,
                                        padding: 16,
                                        backgroundColor: '#fff',
                                        marginRight: 8,
                                    }}
                                >
                                    <View className="flex-row items-center mb-3">
                                        <Image
                                            source={{ uri: item.image }}
                                            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
                                        />
                                        <View>
                                            <Text className="font-semibold text-base">{item.name}</Text>
                                            <Text className="text-sm text-gray-500">{item.role}</Text>
                                            <Text className="text-sm mt-1">Experience: {item.experience}</Text>
                                        </View>
                                    </View>
                                    <ScrollView className="bg-gray-100 p-3 rounded max-h-[50%]">
                                        <Text className="text-sm text-gray-700 leading-relaxed">{item.bio}</Text>
                                    </ScrollView>
                                </View>

                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}