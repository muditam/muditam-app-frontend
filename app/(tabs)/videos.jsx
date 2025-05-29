import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const screenWidth = Dimensions.get('window').width;

const videos = [
  {
    id: 1,
    title: 'How to Manage Blood Sugar Naturally',
    url: 'https://cdn.shopify.com/videos/c/o/v/eec1a9292b424341b1f9ae2c42fdb191.mp4',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID1/hqdefault.jpg',
  },
  {
    id: 2,
    title: 'Top 5 Ayurvedic Tips for Diabetes',
    url: 'https://cdn.shopify.com/videos/c/o/v/b5baf7888efb47599c3efb16f0a79a1e.mp4',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID2/hqdefault.jpg',
  },
  {
    id: 3,
    title: 'What is HbA1c? Explained!',
    url: 'https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID3/hqdefault.jpg',
  },
  {
    id: 4,
    title: 'Beginner’s Guide to Ayurveda',
    url: 'https://cdn.shopify.com/videos/c/o/v/67592f944522471c9c317aee972dccc3.mp4',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID4/hqdefault.jpg',
  },
  {
    id: 5,
    title: 'Diabetes Myths Busted!',
    url: 'https://cdn.shopify.com/videos/c/o/v/6c1d51e9d2644fd88c2ecb29e6393a6a.mp4',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID5/hqdefault.jpg',
  },
];

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handlePress = (video) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Explore Our Videos</Text>
        <View style={styles.grid}>
          {videos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.card}
              onPress={() => handlePress(video)}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={{ uri: video.thumbnail }}
                style={styles.thumbnail}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={styles.playIcon}>
                  <Ionicons name="play-circle" size={48} color="#fff" />
                </View>
              </ImageBackground>
              <Text style={styles.title}>{video.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Video Player Modal */}
      <Modal visible={!!selectedVideo} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedVideo && (
            <Video
              source={{ uri: selectedVideo.url }}
              useNativeControls
              resizeMode="contain"
              style={styles.videoPlayer}
              shouldPlay
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#543287',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (screenWidth - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 50,
    padding: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
    color: '#333',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  videoPlayer: {
    width: screenWidth,
    height: screenWidth * (9 / 16),
    backgroundColor: '#000',
  },
});
