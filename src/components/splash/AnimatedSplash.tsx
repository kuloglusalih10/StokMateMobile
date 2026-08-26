import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const LEN_ROOF = 140;
const LEN_FACE = 260;

const BAR_BASE = { first: 96.667, second: 108, third: 96.667 };

const BASE = {
  roofDelay: 240,
  roofDuration: 800,
  faceLDelay: 720,
  faceLDuration: 960,
  faceRDelay: 960,
  faceRDuration: 960,
  bar1Delay: 1680,
  bar2Delay: 1920,
  bar3Delay: 2160,
  popUpDuration: 420,
  popSettleDuration: 220,
  fillDelay: 2400,
  fillDuration: 640,
  wordDelay: 2560,
  wordDuration: 720,
  stageDelay: 4160,
  stageDuration: 640,
};

const SHORT_FACTOR = 0.4583;

type Props = {
  onFinish?: () => void;
  short?: boolean;
  ready?: boolean;
};

export default function AnimatedSplash({ onFinish, short, ready = true }: Props) {
  const roof = useSharedValue(1);
  const faceL = useSharedValue(1);
  const faceR = useSharedValue(1);

  const bar1 = useSharedValue(0);
  const bar2 = useSharedValue(0);
  const bar3 = useSharedValue(0);

  const fill = useSharedValue(0);
  const word = useSharedValue(0);

  const stage = useSharedValue(1);

  const [entranceDone, setEntranceDone] = useState(false);
  const stageDurationRef = useRef(BASE.stageDuration);

  useEffect(() => {
    if (short === undefined) return;

    const factor = short ? SHORT_FACTOR : 1;
    const t = (ms: number) => Math.round(ms * factor);
    stageDurationRef.current = t(BASE.stageDuration);

    const draw = (durationMs: number) =>
      withTiming(0, { duration: t(durationMs), easing: Easing.out(Easing.cubic) });

    const pop = () =>
      withSequence(
        withTiming(1.06, { duration: t(BASE.popUpDuration), easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: t(BASE.popSettleDuration) })
      );

    roof.value = withDelay(t(BASE.roofDelay), draw(BASE.roofDuration));
    faceL.value = withDelay(t(BASE.faceLDelay), draw(BASE.faceLDuration));
    faceR.value = withDelay(t(BASE.faceRDelay), draw(BASE.faceRDuration));

    bar1.value = withDelay(t(BASE.bar1Delay), pop());
    bar2.value = withDelay(t(BASE.bar2Delay), pop());
    bar3.value = withDelay(t(BASE.bar3Delay), pop());

    fill.value = withDelay(t(BASE.fillDelay), withTiming(1, { duration: t(BASE.fillDuration) }));
    word.value = withDelay(
      t(BASE.wordDelay),
      withTiming(1, { duration: t(BASE.wordDuration), easing: Easing.out(Easing.cubic) })
    );

    const entranceTimer = setTimeout(() => setEntranceDone(true), t(BASE.stageDelay));
    return () => clearTimeout(entranceTimer);
  }, [short]);

  useEffect(() => {
    if (!entranceDone || !ready) return;

    stage.value = withTiming(0, { duration: stageDurationRef.current }, (finished) => {
      if (finished && onFinish) {
        runOnJS(onFinish)();
      }
    });
  }, [entranceDone, ready]);

  const roofProps = useAnimatedProps(() => ({ strokeDashoffset: LEN_ROOF * roof.value }));
  const faceLProps = useAnimatedProps(() => ({ strokeDashoffset: LEN_FACE * faceL.value }));
  const faceRProps = useAnimatedProps(() => ({ strokeDashoffset: LEN_FACE * faceR.value }));
  const fillProps = useAnimatedProps(() => ({ opacity: 0.12 * fill.value }));

  const bar1Props = useAnimatedProps(() => ({
    transform: `translate(0 ${BAR_BASE.first}) scale(1 ${bar1.value}) translate(0 ${-BAR_BASE.first})`,
    opacity: bar1.value > 0 ? 1 : 0,
  }));
  const bar2Props = useAnimatedProps(() => ({
    transform: `translate(0 ${BAR_BASE.second}) scale(1 ${bar2.value}) translate(0 ${-BAR_BASE.second})`,
    opacity: bar2.value > 0 ? 1 : 0,
  }));
  const bar3Props = useAnimatedProps(() => ({
    transform: `translate(0 ${BAR_BASE.third}) scale(1 ${bar3.value}) translate(0 ${-BAR_BASE.third})`,
    opacity: bar3.value > 0 ? 1 : 0,
  }));

  const stageStyle = useAnimatedStyle(() => ({ opacity: stage.value }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [{ translateY: (1 - word.value) * 10 }],
  }));

  return (
    <View style={S.root} pointerEvents="none">
      <Animated.View style={[S.center, stageStyle]}>
        <Svg viewBox="20 17 160 164" width={150} height={154} fill="none">
          <AnimatedPath
            d="M40 74 L100 40 L160 74"
            stroke={Colors.primary}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
            strokeDasharray={LEN_ROOF}
            animatedProps={roofProps}
          />

          <AnimatedG animatedProps={bar1Props}>
            <Path d="M62 75 A9 9 0 0 1 80 75 L80 96.667 L62 86.467 Z" fill={Colors.primary} opacity={0.42} />
          </AnimatedG>
          <AnimatedG animatedProps={bar2Props}>
            <Path d="M91 57 A9 9 0 0 1 109 57 L109 102.9 L100 108 L91 102.9 Z" fill={Colors.primary} opacity={0.7} />
          </AnimatedG>
          <AnimatedG animatedProps={bar3Props}>
            <Path d="M120 37 A9 9 0 0 1 138 37 L138 86.467 L120 96.667 Z" fill={Colors.primary} />
          </AnimatedG>

          <AnimatedPath d="M160 74 L100 108 L100 166 L160 132 Z" fill={Colors.primary} animatedProps={fillProps} />

          <AnimatedPath
            d="M40 74 L100 108 L100 166 L40 132 Z"
            stroke={Colors.primary}
            strokeWidth={7}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={LEN_FACE}
            animatedProps={faceLProps}
          />
          <AnimatedPath
            d="M160 74 L100 108 L100 166 L160 132 Z"
            stroke={Colors.primary}
            strokeWidth={7}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={LEN_FACE}
            animatedProps={faceRProps}
          />
        </Svg>

        <Animated.View style={wordStyle}>
          <Text style={S.wordmark}>
            <Text style={S.wordmarkStok}>Stok</Text>
            <Text style={S.wordmarkMate}>Mate</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  center: {
    alignItems: 'center',
    gap: 22,
  },
  wordmark: {
    fontSize: 30,
    letterSpacing: -0.5,
  },
  wordmarkStok: {
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.white,
  },
  wordmarkMate: {
    fontFamily: 'Archivo_800ExtraBold',
    color: Colors.primary,
  },
});
