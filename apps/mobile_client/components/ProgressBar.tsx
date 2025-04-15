import { StyleSheet, View, Text, ViewStyle, ColorValue } from 'react-native';
import { Colors } from '@/constants/Colors';


type ProgressBarProps = {
  progressFunc: () => number,
  backgroundColor: ColorValue,
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progressFunc, backgroundColor }) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>{progressFunc()}%</Text>
      <View style={[styles.progressBar,
            { backgroundColor: backgroundColor} as ViewStyle]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressFunc()}%` } as ViewStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    marginRight: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  }
});

export default ProgressBar;