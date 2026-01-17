// src/components/KeyboardScreen.js
// Ortak ekran wrapper'ı: klavye açıldığında içerik gizlenmesin ve tap ile kapansın.
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import ScreenContainer from "./ScreenContainer";

export default function KeyboardScreen({ children, contentContainerStyle, scrollProps }) {
  let headerHeight = 0;
  try {
    // Header yüksekliği varsa iOS'ta offset için kullan.
    headerHeight = useHeaderHeight();
  } catch {
    headerHeight = 0;
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            {...scrollProps}
          >
            {children}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
