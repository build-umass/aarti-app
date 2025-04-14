import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';


type ProgressBarProps = {
  calculateProgress: () => number
};

const ProgressBar: React.FC<ProgressBarProps> = ({ calculateProgress }) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>{calculateProgress()}%</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${calculateProgress()}%` } as ViewStyle,
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
    marginBottom: 24,
  },
  progressText: {
    fontSize: 24,
    marginRight: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
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