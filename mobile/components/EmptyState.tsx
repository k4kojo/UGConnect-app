import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import Colors from '@/constants/colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  iconSize?: number;
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-outline',
  title,
  subtitle,
  iconSize = 64,
  style,
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();

  return (
    <View style={[styles.emptyState, style]}>
      <Ionicons name={icon} size={iconSize} color={themeColors.subText} />
      <Text style={[styles.emptyStateTitle, { color: themeColors.text }]}>
        {t(title)}
      </Text>
      {subtitle && (
        <Text style={[styles.emptyStateSubtitle, { color: themeColors.subText }]}>
          {t(subtitle)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default EmptyState;
