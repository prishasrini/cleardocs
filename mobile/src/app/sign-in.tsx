import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "@/components/AuthHeader";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Notice from "@/components/Notice";
import { useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // No navigation needed: the protected routes in _layout switch screens automatically
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Welcome back" subtitle="Log in to track your document requests." />

          <View style={styles.form}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              onSubmitEditing={handleSignIn}
            />
            {!!error && <Notice tone="error" title="Couldn't log in" message={error} />}
            <Button title="Log in" onPress={handleSignIn} loading={loading} />
          </View>

          <Text style={styles.switch}>
            New to ClearDocs?{" "}
            <Link href="/sign-up" style={styles.link}>
              Create an account
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  form: { gap: 16 },
  switch: { marginTop: 28, textAlign: "center", color: colors.muted, fontSize: 15 },
  link: { color: colors.stamp, fontWeight: "700" },
});
