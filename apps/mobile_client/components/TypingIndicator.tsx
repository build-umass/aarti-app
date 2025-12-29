import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    withSequence,
    Easing,
} from 'react-native-reanimated';

interface TypingIndicatorProps {
    color?: string;
    size?: number;
}

/**
 * A typing indicator component that shows three animated dots
 * bouncing in sequence, similar to iMessage typing indicator.
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    color = '#888',
    size = 8,
}) => {
    const dot1Scale = useSharedValue(1);
    const dot2Scale = useSharedValue(1);
    const dot3Scale = useSharedValue(1);

    useEffect(() => {
        // Create bouncing animation for each dot with staggered delays
        const animationConfig = {
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        };

        dot1Scale.value = withRepeat(
            withSequence(
                withTiming(1.4, animationConfig),
                withTiming(1, animationConfig)
            ),
            -1,
            false
        );

        dot2Scale.value = withDelay(
            150,
            withRepeat(
                withSequence(
                    withTiming(1.4, animationConfig),
                    withTiming(1, animationConfig)
                ),
                -1,
                false
            )
        );

        dot3Scale.value = withDelay(
            300,
            withRepeat(
                withSequence(
                    withTiming(1.4, animationConfig),
                    withTiming(1, animationConfig)
                ),
                -1,
                false
            )
        );
    }, []);

    const dot1Style = useAnimatedStyle(() => ({
        transform: [{ scale: dot1Scale.value }],
    }));

    const dot2Style = useAnimatedStyle(() => ({
        transform: [{ scale: dot2Scale.value }],
    }));

    const dot3Style = useAnimatedStyle(() => ({
        transform: [{ scale: dot3Scale.value }],
    }));

    const dotStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        marginHorizontal: 3,
    };

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <View style={styles.dotsContainer}>
                    <Animated.View style={[dotStyle, dot1Style]} />
                    <Animated.View style={[dotStyle, dot2Style]} />
                    <Animated.View style={[dotStyle, dot3Style]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        margin: 8,
    },
    bubble: {
        backgroundColor: '#e5e5ea',
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
    },
});

export default TypingIndicator;
