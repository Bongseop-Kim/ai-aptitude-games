import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";

interface ImageCarouselProps {
  images: any[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get("window").width;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / screenWidth);
    setCurrentPage(page);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.imageContainer, { width: screenWidth }]}>
      <Image source={item} style={styles.image} contentFit="contain" />
    </View>
  );

  return (
    <ThemedView>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
      />
      <View style={styles.pageIndicator}>
        <ThemedView style={styles.badge}>
          <ThemedText type="captionS" style={styles.badgeText}>
            {currentPage + 1}/{images.length}
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: Dimensions.get("window").width,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pageIndicator: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  badgeText: {
    color: "#FFFFFF",
  },
});
