import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import React from 'react';
import { Pressable, type NativeSyntheticEvent, type TextLayoutEventData } from 'react-native';
import ThemedText, { type ThemedTextProps } from '@/components/atoms/a-themed-text';

export type TruncatedTextProps = ThemedTextProps & {
  text: string;
  /** Lines shown while collapsed. The toggle only appears if the text exceeds this. Defaults to 4. */
  collapsedLines?: number;
};

const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  collapsedLines = 4,
  style,
  ...rest
}) => {
  const colors = useThemeColors();
  const [expanded, setExpanded] = React.useState(false);
  const [totalLines, setTotalLines] = React.useState<number | null>(null);

  const isTruncatable = totalLines !== null && totalLines > collapsedLines;

  const handleMeasureLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    setTotalLines(e.nativeEvent.lines.length);
  };

  return (
    <>
      <ThemedText
        style={style}
        numberOfLines={isTruncatable && !expanded ? collapsedLines : undefined}
        {...rest}
      >
        {text}
      </ThemedText>

      {/* Offscreen, unclamped copy used only to count the true line count. */}
      {totalLines === null && (
        <ThemedText
          aria-hidden
          style={[style, { position: 'absolute', left: 0, right: 0, opacity: 0 }]}
          onTextLayout={handleMeasureLayout}
          {...rest}
        >
          {text}
        </ThemedText>
      )}

      {isTruncatable && (
        <Pressable onPress={() => setExpanded((prev) => !prev)} hitSlop={8}>
          <ThemedText
            className="mt-2"
            style={{ fontSize: 14, fontFamily: Fonts.medium, color: colors.primary }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </ThemedText>
        </Pressable>
      )}
    </>
  );
};

export default TruncatedText;
