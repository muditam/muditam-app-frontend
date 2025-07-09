// FullscreenFeed.js
import React, { useRef, useState, useCallback } from 'react';
import { FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import VideoFeedItem from './components/VideoFeedItem';

const { height } = Dimensions.get('window');

const videos = [
  { id: '1', video: 'https://cdn.shopify.com/videos/c/o/v/9603ccc053314a139fe15c15f95ea5a8.mp4' },
  { id: '2', video: 'https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4' },
  { id: '3', video: 'https://cdn.shopify.com/videos/c/o/v/3733915a671b4905adf3e87ce18c1a1e.mp4' },
  { id: '4', video: 'https://cdn.shopify.com/videos/c/o/v/1d8505c4968747469d631c46c440daac.mp4' },
  { id: '5', video: 'https://cdn.shopify.com/videos/c/o/v/9603ccc053314a139fe15c15f95ea5a8.mp4' },
];

export default function FullscreenFeed() {
  const { video } = useLocalSearchParams();
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const startIndex = videos.findIndex((v) => v.video === video);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  return (
    <FlatList
      ref={flatListRef}
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <VideoFeedItem
          video={item.video}
          isActive={index === activeIndex}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
      initialScrollIndex={startIndex !== -1 ? startIndex : 0}
      getItemLayout={(data, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
    />
  );
}
