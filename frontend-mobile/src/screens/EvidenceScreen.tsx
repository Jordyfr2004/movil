import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { formatReservationDate } from "../utils/date";

type EvidenceItem = {
  id: string;
  imageUri: string;
  observation: string;
  createdAt: string; // ISO
};

const OBSERVATION_MAX_LENGTH = 200;

export function EvidenceScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [items, setItems] = useState<EvidenceItem[]>([]);

  const canSave = useMemo(() => {
    return Boolean(imageUri) && observation.trim().length > 0;
  }, [imageUri, observation]);

  const requestCameraPermissionIfNeeded = async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;
    const next = await ImagePicker.requestCameraPermissionsAsync();
    return next.granted;
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setImageUri(asset.uri);
  };

  const takePhoto = async () => {
    const granted = await requestCameraPermissionIfNeeded();
    if (!granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas permitir el acceso a la cámara para tomar una foto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setImageUri(asset.uri);
  };

  const saveEvidence = () => {
    if (!imageUri) {
      Alert.alert("Sin imagen", "Debes seleccionar o tomar una imagen.");
      return;
    }

    if (observation.trim().length === 0) {
      Alert.alert("Sin observación", "La observación es obligatoria.");
      return;
    }

    const createdAt = new Date().toISOString();

    const newItem: EvidenceItem = {
      id: `${Date.now()}`,
      imageUri,
      observation: observation.trim(),
      createdAt,
    };

    setItems((prev) => [newItem, ...prev]);
    setImageUri(null);
    setObservation("");
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Eliminar evidencia",
      "¿Seguro que deseas eliminar este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setItems((prev) => prev.filter((x) => x.id !== id));
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Registro de evidencias</Text>
        <Text style={styles.subtitle}>
          Captura una imagen, escribe una observación y guarda el registro.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Imagen seleccionada</Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewEmpty}>
            <Text style={styles.previewEmptyText}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <AppButton
            label="Elegir de galería"
            variant="secondary"
            size="sm"
            onPress={pickFromLibrary}
          />
          <AppButton
            label={Platform.OS === "web" ? "Tomar foto" : "Cámara"}
            variant="secondary"
            size="sm"
            onPress={takePhoto}
          />
        </View>

        <View style={styles.formGap}>
          <AppInput
            label="Observación *"
            value={observation}
            onChangeText={setObservation}
            placeholder="Describe lo que registras"
            autoCapitalize="sentences"
            multiline
            numberOfLines={3}
            maxLength={OBSERVATION_MAX_LENGTH}
          />
        </View>

        <View style={styles.formActions}>
          <AppButton
            label="Guardar evidencia"
            onPress={saveEvidence}
            disabled={!canSave}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Evidencias registradas</Text>
        <Text style={styles.sectionMeta}>{items.length}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aún no tienes evidencias</Text>
            <Text style={styles.emptySubtitle}>
              Guarda una evidencia para verla listada aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemTop}>
              <Image source={{ uri: item.imageUri }} style={styles.itemThumb} />
              <View style={styles.itemBody}>
                <Text style={styles.itemObservation} numberOfLines={2}>
                  {item.observation}
                </Text>
                <Text style={styles.itemMeta}>
                  {formatReservationDate(item.createdAt)}
                </Text>
              </View>
            </View>

            <AppButton
              label="Eliminar"
              variant="danger"
              size="sm"
              onPress={() => confirmDelete(item.id)}
              style={styles.deleteButton}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.sm,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  previewEmpty: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  previewEmptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  formGap: {
    marginTop: spacing.lg,
  },
  formActions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  itemBody: {
    flex: 1,
    gap: spacing.xs,
  },
  itemObservation: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  itemMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  deleteButton: {
    alignSelf: "flex-start",
  },
});
