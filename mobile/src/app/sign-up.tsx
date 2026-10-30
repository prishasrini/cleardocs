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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    // Check the form on the phone first, so the user gets instant feedback
    const found: typeof errors = {};
    if (!name.trim()) found.name = "Enter your name.";
    if (!EMAIL_PATTERN.test(email.trim())) found.email = "Enter an email like name@example.com.";
    if (password.length < 6) found.password = "Use at least 6 characters.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setServerError("");
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (err) {
      setServerError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Create your account" subtitle="Submit documents and follow every stamp from here." />

          <View style={styles.form}>
            <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" error={errors.name} />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              error={errors.email}
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              error={errors.password}
              onSubmitEditing={handleSignUp}
            />
            {!!serverError && <Notice tone="error" title="Couldn't create your account" message={serverError} />}
            <Button title="Create account" onPress={handleSignUp} loading={loading} />
          </View>

          <Text style={styles.switch}>
            Already have an account?{" "}
            <Link href="/sign-in" style={styles.link}>
              Log in
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
